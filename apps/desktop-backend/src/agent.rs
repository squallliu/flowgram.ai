use crate::{
    agent_stream::ModelResponse,
    conversation::{ConversationItem, Turn, display_payload},
    error::{Error, Result},
    store::Store,
    tools,
};
use serde_json::{Value, json};
use tokio_util::sync::CancellationToken;

const MAX_TOOL_ARGUMENT_BYTES: usize = 512_000;
fn parse_tool_arguments(text: &str) -> Result<Value> {
    if text.len() > MAX_TOOL_ARGUMENT_BYTES {
        return Err(Error::Invalid(
            "Tool arguments exceed the 512 KB limit".into(),
        ));
    }
    serde_json::from_str(text).map_err(|_| Error::Invalid("Tool arguments are invalid JSON".into()))
}

const INSTRUCTIONS: &str = include_str!("../prompts/workflow-assistant.txt");
const WORKFLOW_AGENT_INSTRUCTIONS: &str = include_str!("../prompts/workflow-agent.txt");
pub fn output_text(response: &Value) -> String {
    response["output"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|item| item["content"].as_array().into_iter().flatten())
        .filter_map(|c| c["text"].as_str())
        .collect::<Vec<_>>()
        .join("")
}
impl Store {
    pub async fn complete_model(&self, input: Value, cancel: &CancellationToken) -> Result<Value> {
        self.request_model(input, cancel, None, None).await
    }
    pub async fn request_model(
        &self,
        input: Value,
        cancel: &CancellationToken,
        tools: Option<Value>,
        instructions: Option<&str>,
    ) -> Result<Value> {
        let project = self.projects().await?.remove(0).id;
        let model = self
            .deployment_settings
            .resolve_model(
                &crate::models::Selection::default(),
                &project,
                tools.is_some(),
                false,
            )
            .await?;
        Ok(self
            .request_model_stream(input, cancel, tools, instructions, None, &model)
            .await?
            .value)
    }
    async fn request_model_stream(
        &self,
        input: Value,
        cancel: &CancellationToken,
        tools: Option<Value>,
        instructions: Option<&str>,
        turn: Option<&str>,
        model: &crate::models::Resolved,
    ) -> Result<ModelResponse> {
        crate::models::request(
            &self.deployment_settings,
            model,
            crate::models::transport::Query {
                input,
                tools,
                instructions,
                turn,
                force_tool: false,
                trace: None,
            },
            cancel,
            Some(self),
        )
        .await
    }
    #[allow(clippy::too_many_arguments)]
    pub(crate) async fn workflow_agent(
        &self,
        prompt: &str,
        run: &str,
        node: &str,
        steps: usize,
        context: &crate::control_runtime::ExecutionContext,
        model: &crate::models::Resolved,
        cancel: &CancellationToken,
    ) -> Result<Value> {
        let project = model.project_id.as_str();
        let allowed = [
            "list_workflows",
            "inspect_workflow",
            "validate_workflow",
            "get_run",
            "list_node_types",
        ];
        let definitions = tools::definitions()
            .as_array()
            .unwrap()
            .iter()
            .filter(|tool| allowed.contains(&tool["name"].as_str().unwrap_or_default()))
            .cloned()
            .collect::<Vec<_>>();
        let mut input = vec![json!({"role":"user","content":prompt})];
        for step in 0..steps {
            let response = self
                .request_workflow_model(
                    run,
                    node,
                    model,
                    crate::models::transport::Query {
                        input: json!(input),
                        tools: Some(json!(definitions)),
                        instructions: Some(WORKFLOW_AGENT_INSTRUCTIONS),
                        turn: None,
                        force_tool: false,
                        trace: None,
                    },
                    context,
                    cancel,
                )
                .await?;
            let output = response["output"]
                .as_array()
                .ok_or_else(|| Error::Execution("Invalid agent output format".into()))?;
            input.extend(output.iter().cloned());
            let calls = output
                .iter()
                .filter(|item| item["type"] == "function_call")
                .collect::<Vec<_>>();
            if calls.is_empty() {
                return Ok(json!({"result":output_text(&response),"steps":step+1}));
            }
            for call in calls {
                if cancel.is_cancelled() {
                    return Err(Error::Cancelled);
                }
                let name = call["name"].as_str().unwrap_or_default();
                let call_id = call["call_id"].as_str().unwrap_or_default();
                let args = parse_tool_arguments(call["arguments"].as_str().unwrap_or("{}"));
                let span = self
                    .begin_trace_call(
                        run,
                        node,
                        "tool",
                        name,
                        args.as_ref().cloned().unwrap_or(Value::Null),
                        json!({"callId":call_id}),
                        context,
                    )
                    .await?;
                let result = if !allowed.contains(&name) {
                    Err(Error::Invalid(
                        "This agent may only use read-only workflow tools".into(),
                    ))
                } else {
                    match args {
                        Ok(args) => {
                            let published: bool = sqlx::query_scalar(
                                "SELECT EXISTS(SELECT 1 FROM service_runs WHERE run_id=?)",
                            )
                            .bind(run)
                            .fetch_one(&self.db)
                            .await?;
                            if published {
                                self.published_agent_tool(run, name, args).await
                            } else {
                                self.tool(project, None, name, args).await
                            }
                        }
                        Err(error) => Err(error),
                    }
                };
                self.finish_trace_call(run, node, "tool", &span, &result, context)
                    .await?;
                let value = match result {
                    Ok(value) => value,
                    Err(error) => json!({"error":error.to_string()}),
                };
                input.push(json!({"type":"function_call_output","call_id":call_id,"output":value.to_string()}));
            }
        }
        Err(Error::Execution(
            "Agent reached the configured tool step limit".into(),
        ))
    }
    pub(crate) async fn agent_turn(
        &self,
        turn: &Turn,
        project: &str,
        cancel: &CancellationToken,
    ) -> Result<()> {
        let history = sqlx::query_scalar::<_, String>(
            "SELECT i.data FROM conversation_items i JOIN conversation_turns t ON t.id=i.turn_id WHERE t.session_id=? AND (json_extract(i.data,'$.kind')='user' OR (json_extract(i.data,'$.kind')='assistant' AND json_extract(i.data,'$.phase')='final')) ORDER BY t.ordinal DESC,i.ordinal DESC LIMIT 40",
        ).bind(&turn.session_id).fetch_all(&self.db).await?;
        let mut input: Vec<Value> = history
            .iter()
            .rev()
            .map(|data| {
                let item: ConversationItem = serde_json::from_str(data)?;
                let role = if item.kind == "user" {
                    "user"
                } else {
                    "assistant"
                };
                let content = if item.kind == "user" && !item.payload["references"].is_null() {
                    format!(
                        "{}\n\nUser-referenced context (workflow IDs are authoritative; start/end are UTF-16 offsets of inline @labels in the user message, preserving their order and surrounding instructions): {}",
                        item.content, item.payload["references"]
                    )
                } else {
                    item.content
                };
                Ok(json!({"role":role,"content":content}))
            })
            .collect::<Result<_>>()?;
        let records=sqlx::query_scalar::<_,String>("SELECT conversation_items.data FROM conversation_items JOIN conversation_turns ON conversation_turns.id=conversation_items.turn_id WHERE conversation_turns.session_id=? AND conversation_items.turn_id!=? AND json_extract(conversation_items.data,'$.kind')='tool' ORDER BY conversation_turns.ordinal DESC,conversation_items.ordinal DESC LIMIT 24").bind(&turn.session_id).bind(&turn.id).fetch_all(&self.db).await?;
        let facts:Vec<Value>=records.iter().filter_map(|s|serde_json::from_str::<crate::conversation::ConversationItem>(s).ok()).filter(|i|i.kind=="tool").map(|i|json!({"tool":i.payload["name"],"status":i.status,"result":i.payload["result"]})).collect();
        if !facts.is_empty() {
            input.insert(0,json!({"role":"assistant","content":format!("Prior execution records (do not repeat external operations with unknown outcomes; inspect their status first if needed): {}",json!(facts))}));
        }
        let pinned_model = self.turn_model(&turn.id).await?;
        for _ in 0..12 {
            if cancel.is_cancelled() {
                return Err(Error::Cancelled);
            }
            let early = self.take_supplements(&turn.id).await?;
            for supplement in early {
                input.push(json!({"role":"user","content":supplement.model_text()}));
            }
            self.turn_phase(&turn.id, "model").await?;
            let mut response = self
                .request_model_stream(
                    json!(input),
                    cancel,
                    Some(tools::definitions()),
                    Some(INSTRUCTIONS),
                    Some(&turn.id),
                    &pinned_model,
                )
                .await?;
            let output = response.value["output"]
                .as_array()
                .ok_or_else(|| Error::Execution("Invalid model output format".into()))?;
            input.extend(output.iter().cloned());
            let calls: Vec<_> = output
                .iter()
                .enumerate()
                .filter(|(_, item)| item["type"] == "function_call")
                .collect();
            if calls.len() > 32 {
                return Err(Error::Execution(
                    "Model exceeded the per-response tool call limit".into(),
                ));
            }
            if calls.is_empty() {
                if cancel.is_cancelled() {
                    return Err(Error::Cancelled);
                }
                if response.text.as_ref().is_none_or(|i| i.content.is_empty()) {
                    return Err(Error::Execution(
                        "The model did not return a displayable response".into(),
                    ));
                }
                let supplements = self
                    .finish_turn_success(&turn.id, response.text.as_ref().map(|i| i.id.as_str()))
                    .await?;
                if supplements.is_empty() {
                    return Ok(());
                }
                for supplement in supplements {
                    input.push(json!({"role":"user","content":supplement.model_text()}));
                }
                continue;
            }
            let mut redirected = false;
            let mut supplements = Vec::new();
            for (index, call) in calls {
                if cancel.is_cancelled() {
                    return Err(Error::Cancelled);
                }
                let updates = self.take_supplements(&turn.id).await?;
                if !updates.is_empty() {
                    redirected = true;
                    supplements.extend(updates);
                }
                let item = response
                    .tools
                    .get_mut(&index)
                    .ok_or_else(|| Error::Execution("Missing tool call identity".into()))?;
                let name = call["name"].as_str().unwrap_or_default();
                let call_id = call["call_id"]
                    .as_str()
                    .filter(|s| !s.is_empty())
                    .ok_or_else(|| {
                        Error::Execution("The model did not provide a tool call ID".into())
                    })?;
                if redirected {
                    item.status = "cancelled".into();
                    item.payload["result"] = json!({"reason":"The user updated this turn's instructions. Unstarted calls were canceled; replan using the new instructions"});
                    self.put_item(item).await?;
                    input.push(json!({"type":"function_call_output","call_id":call_id,"output":"The user updated this turn's instructions. This call was not executed. Replan using the new instructions."}));
                    continue;
                }
                self.turn_phase(&turn.id, "tool").await?;
                item.status = "running".into();
                item.payload["startedAt"] = json!(crate::store::now());
                self.put_item(item).await?;
                let result =
                    match parse_tool_arguments(call["arguments"].as_str().unwrap_or_default()) {
                        Ok(args) => self.tool(project, Some(&turn.session_id), name, args).await,
                        Err(error) => Err(error),
                    };
                let (value, is_error) = match result {
                    Ok(value) => (value, false),
                    Err(error) => (json!({"error":error.to_string()}), true),
                };
                if matches!(name, "run_workflow" | "test_node")
                    && !is_error
                    && let Some(run) = value["id"].as_str()
                {
                    self.link_turn_run(&turn.id, run).await?;
                }
                item.status = if is_error { "failed" } else { "completed" }.into();
                item.payload["result"] = display_payload(&value);
                item.payload["isError"] = json!(is_error);
                item.payload["endedAt"] = json!(crate::store::now());
                self.put_item(item).await?;
                input.push(json!({"type":"function_call_output","call_id":call_id,"output":value.to_string()}));
            }
            // All tool outputs precede supplementary user input, preserving the provider protocol.
            for supplement in supplements {
                input.push(json!({"role":"user","content":supplement.model_text()}));
            }
        }
        Err(Error::Execution(
            "Reached the limit of 12 model requests. Start a new turn to continue".into(),
        ))
    }
}

#[cfg(test)]
mod language_tests {
    use super::*;

    #[test]
    fn default_instructions_and_tools_are_english_and_do_not_force_response_language() {
        let has_han = |text: &str| text.chars().any(|c| ('\u{3400}'..='\u{9fff}').contains(&c));
        assert!(!has_han(INSTRUCTIONS));
        assert!(!has_han(WORKFLOW_AGENT_INSTRUCTIONS));
        assert!(!has_han(&tools::definitions().to_string()));
        assert!(!has_han(
            &serde_json::to_string(&*crate::nodes::CATALOG).unwrap()
        ));
        assert!(!has_han(
            &serde_json::to_string(&*crate::control::CATALOG).unwrap()
        ));
        assert!(INSTRUCTIONS.contains("Match the language of the user's request"));
        assert!(WORKFLOW_AGENT_INSTRUCTIONS.contains("Match the language of the input request"));
        assert!(INSTRUCTIONS.contains("Do not narrate every call"));
    }
}

#[cfg(test)]
mod argument_tests {
    use super::*;
    #[test]
    fn large_workflow_arguments_are_supported_without_unbounded_payloads() {
        let graph = json!({"schema":{"nodes":(0..100).map(|index| json!({"id":format!("node_{index}"),"type":"assign","data":{"title":"Business transformation","inputsValues":{"payload":{"type":"constant","content":"x".repeat(300)}}}})).collect::<Vec<_>>(),"edges":[]}});
        let text = graph.to_string();
        assert!(text.len() > 20000);
        assert_eq!(parse_tool_arguments(&text).unwrap(), graph);
        assert!(parse_tool_arguments(&"x".repeat(MAX_TOOL_ARGUMENT_BYTES + 1)).is_err());
        assert!(parse_tool_arguments("{").is_err());
    }
}
