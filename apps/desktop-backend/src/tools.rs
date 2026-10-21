use crate::{
    error::{Error, Result},
    runtime,
    store::Store,
};
use serde_json::{Value, json};

pub fn definitions() -> Value {
    let specs = [
        (
            "list_models",
            "List model IDs, capabilities, defaults and availability for this project. Set data.model.modelId and optional data.model.parameters on llm/agent nodes. Never infer capabilities from names. Credentials are managed by the user in Settings.",
            json!({}),
            vec![],
        ),
        (
            "list_node_types",
            "Discover available nodes. Specify nodeType for the complete configuration contract, operation enums, defaults, and output schema. Use query to filter by name or capability.",
            json!({"nodeType":{"type":"string"},"query":{"type":"string"}}),
            vec![],
        ),
        (
            "list_workflows",
            "List workflows in the current project.",
            json!({}),
            vec![],
        ),
        (
            "inspect_workflow",
            "Read a workflow schema and its current revision.",
            json!({"workflowId":{"type":"string"}}),
            vec!["workflowId"],
        ),
        (
            "create_workflow",
            "Create a workflow draft using a FlowGram schema with nodes and edges.",
            json!({"name":{"type":"string"},"schema":{"type":"object","additionalProperties":true}}),
            vec!["name", "schema"],
        ),
        (
            "save_workflow",
            "Save a complete workflow with the expected revision. Read the latest workflow again on a revision conflict.",
            json!({"workflowId":{"type":"string"},"revision":{"type":"integer"},"name":{"type":"string"},"schema":{"type":"object","additionalProperties":true}}),
            vec!["workflowId", "revision", "name", "schema"],
        ),
        (
            "validate_workflow",
            "Validate workflow structure, connections, and executable nodes.",
            json!({"workflowId":{"type":"string"}}),
            vec!["workflowId"],
        ),
        (
            "run_workflow",
            "Run a workflow in the current project. inputs must be an object. Returns a run ID; query get_run for completion and results.",
            json!({"workflowId":{"type":"string"},"inputs":{"type":"object","additionalProperties":true}}),
            vec!["workflowId", "inputs"],
        ),
        (
            "test_node",
            "Test one node with explicit resolved inputs and upstream output samples in bindings, without executing upstream nodes. Requires the current workflow revision. Returns a run ID.",
            json!({"workflowId":{"type":"string"},"nodeId":{"type":"string"},"revision":{"type":"integer"},"inputs":{"type":"object","additionalProperties":true},"bindings":{"type":"object","additionalProperties":true}}),
            vec!["workflowId", "nodeId", "revision", "inputs"],
        ),
        (
            "get_run",
            "Read run results, pinned dependency manifest and up to 50 node events. Follow nextAfter using after to read subsequent event pages; do not repeatedly fetch the same page.",
            json!({"runId":{"type":"string"},"after":{"type":"integer","minimum":0}}),
            vec!["runId"],
        ),
    ];
    Value::Array(specs.into_iter().map(|(name,description,properties,required)|json!({"type":"function","name":name,"description":description,"parameters":{"type":"object","properties":properties,"required":required,"additionalProperties":false},"strict":false})).collect())
}
fn string<'a>(args: &'a Value, key: &str) -> Result<&'a str> {
    args.get(key)
        .and_then(Value::as_str)
        .ok_or_else(|| Error::Invalid(format!("Missing argument: {key}")))
}
impl Store {
    pub async fn tool(
        &self,
        project: &str,
        session: Option<&str>,
        name: &str,
        args: Value,
    ) -> Result<Value> {
        self.require_project(project).await?;
        if let Some(session) = session
            && self.session(session).await?.project_id != project
        {
            return Err(Error::Invalid(
                "The session does not belong to the current project".into(),
            ));
        }
        if name == "list_models" {
            let mut models = Vec::new();
            for model in self.deployment_settings.model_entries().await? {
                let available = self
                    .deployment_settings
                    .resolve_model(
                        &crate::models::Selection {
                            model_id: Some(model.id.clone()),
                            parameters: Default::default(),
                        },
                        project,
                        false,
                        false,
                    )
                    .await
                    .is_ok();
                models.push(json!({"id":model.id,"name":model.name,"modelId":model.model_id,"capabilities":model.capabilities,"parameters":model.parameters,"available":available}));
            }
            return Ok(
                json!({"models":models,"defaults":self.deployment_settings.model_defaults().await?}),
            );
        }
        if name == "list_node_types" {
            if let Some(kind) = args["nodeType"].as_str() {
                return crate::nodes::definition(kind)
                    .or_else(|| crate::control::definition(kind))
                    .or_else(|| crate::core_nodes::definition(kind))
                    .cloned()
                    .ok_or_else(|| Error::Invalid(format!("Unknown node type: {kind}")));
            }
            let query = args["query"].as_str().unwrap_or_default().to_lowercase();
            let nodes:Vec<_>=crate::nodes::CATALOG.iter().chain(crate::control::CATALOG.iter()).chain(crate::core_nodes::CATALOG.iter()).filter(|node|query.is_empty()||node.to_string().to_lowercase().contains(&query)).map(|node|json!({"type":node["type"],"title":node["title"],"group":node["group"],"description":node["description"]})).collect();
            return Ok(
                json!({"types":runtime::supported_types(),"nodes":nodes,"contract":"Before using a new node, request its full contract with nodeType. fields at inputsValues.* use constant/reference bindings. Store mapping, predicate, keys, and other static fields directly under node data.","binding":{"constant":{"type":"constant","content":"typed value"},"reference":{"type":"ref","content":["nodeId","field"]}},"limits":{"maxItems":10000,"maxBytes":2000000}}),
            );
        }
        if name == "list_workflows" {
            return Ok(serde_json::to_value(
                self.workflows()
                    .await?
                    .into_iter()
                    .filter(|w| w.project_id == project)
                    .collect::<Vec<_>>(),
            )?);
        }
        if name == "create_workflow" {
            let schema = args
                .get("schema")
                .filter(|v| v.is_object())
                .cloned()
                .ok_or_else(|| Error::Invalid("Missing schema object".into()))?;
            let _: crate::model::Graph = serde_json::from_value(schema.clone())?;
            return Ok(serde_json::to_value(
                self.create_workflow(project, string(&args, "name")?, schema)
                    .await?,
            )?);
        }
        if name == "get_run" {
            let run = self.run(string(&args, "runId")?).await?;
            if self.workflow(&run.workflow_id).await?.project_id != project {
                return Err(Error::Invalid(
                    "The run does not belong to the current project".into(),
                ));
            }
            let mut events = self
                .run_history(&run.id, args["after"].as_i64().unwrap_or(0), None)
                .await?;
            events.truncate(50);
            let next = if events.len() == 50 {
                events.last().map(|e| e.sequence)
            } else {
                None
            };
            return Ok(
                json!({"models":self.run_model_traces(&run.id).await?,"run":run,"events":events,"nextAfter":next,"nodeTest":self.node_test_definition(&run.id).await?,"manifest":self.run_manifest(&run.id).await?}),
            );
        }
        let workflow = self.workflow(string(&args, "workflowId")?).await?;
        if workflow.project_id != project {
            return Err(Error::Invalid(
                "The workflow does not belong to the current project".into(),
            ));
        }
        match name {
            "test_node" => {
                let input = crate::node_test::NodeTestInput {
                    revision: args["revision"]
                        .as_i64()
                        .ok_or_else(|| Error::Invalid("Missing revision".into()))?,
                    inputs: args
                        .get("inputs")
                        .cloned()
                        .ok_or_else(|| Error::Invalid("Missing inputs".into()))?,
                    bindings: serde_json::from_value(
                        args.get("bindings").cloned().unwrap_or(json!({})),
                    )?,
                };
                Ok(serde_json::to_value(
                    self.start_node_test(&workflow.id, string(&args, "nodeId")?, input)
                        .await?,
                )?)
            }
            "inspect_workflow" => Ok(serde_json::to_value(workflow)?),
            "save_workflow" => {
                let schema = args
                    .get("schema")
                    .filter(|v| v.is_object())
                    .cloned()
                    .ok_or_else(|| Error::Invalid("Missing schema object".into()))?;
                let _: crate::model::Graph = serde_json::from_value(schema.clone())?;
                let revision = args["revision"]
                    .as_i64()
                    .ok_or_else(|| Error::Invalid("Missing revision".into()))?;
                Ok(serde_json::to_value(
                    self.save_workflow(&workflow.id, revision, string(&args, "name")?, schema)
                        .await?,
                )?)
            }
            "validate_workflow" => {
                let errors = runtime::validate(&workflow.schema)?;
                Ok(
                    json!({"valid":errors.is_empty(),"errors":errors,"supportedNodes":runtime::supported_types()}),
                )
            }
            "run_workflow" => Ok(serde_json::to_value(
                self.start_run(
                    &workflow.id,
                    session.map(str::to_owned),
                    args.get("inputs").cloned().unwrap_or(json!({})),
                )
                .await?,
            )?),
            _ => Err(Error::Invalid(format!("Unknown tool {name}"))),
        }
    }
}
