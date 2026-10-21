use crate::{
    conversation::{ConversationInput, ConversationItem, Turn, TurnOrigin, display_payload},
    error::{Error, Result},
    store::{Store, id, now},
};
use serde_json::{Value, json};

/// Authored walkthrough text uses the same transcript model as normal conversations.
/// Tools and runs are executed, never fabricated or replayed by a model during setup.
pub(super) struct Walkthrough<'a> {
    store: &'a Store,
    project: &'a str,
    turn: Turn,
}
impl<'a> Walkthrough<'a> {
    pub async fn begin(
        store: &'a Store,
        project: &'a str,
        session: &str,
        text: String,
        workflow: Option<&str>,
        estimated_duration_ms: u64,
    ) -> Result<Self> {
        let input_id = id();
        let mut turn = Turn {
            id: id(),
            session_id: session.into(),
            initiating_input_id: input_id.clone(),
            status: "running".into(),
            phase: "tool".into(),
            revision: 1,
            ordinal: 0,
            started_at: now(),
            ended_at: None,
            final_item_id: None,
            origin: TurnOrigin::Authored,
            estimated_duration_ms: Some(estimated_duration_ms),
            model: None,
            error: None,
        };
        let input = ConversationInput {
            id: input_id.clone(),
            client_input_id: id(),
            session_id: session.into(),
            content: text.clone(),
            model: None,
            references: workflow
                .map(|w| json!({"workflowId":w}))
                .unwrap_or(Value::Null),
            delivery_mode: "queue".into(),
            turn_id: Some(turn.id.clone()),
            status: "accepted".into(),
            revision: 1,
            created_at: now(),
            error: None,
        };
        let user = ConversationItem {
            id: input_id,
            session_id: session.into(),
            turn_id: turn.id.clone(),
            ordinal: 1,
            kind: "user".into(),
            status: "completed".into(),
            phase: "input".into(),
            content: text,
            payload: json!({"references":input.references,"deliveryMode":"queue"}),
            revision: 1,
            created_at: now(),
            updated_at: now(),
        };
        let mut tx = store.db.begin().await?;
        turn.ordinal=sqlx::query_scalar("INSERT INTO conversation_turns(id,session_id,status,data) VALUES(?,?,'running',?) RETURNING ordinal").bind(&turn.id).bind(session).bind(serde_json::to_string(&turn)?).fetch_one(&mut *tx).await?;
        sqlx::query("UPDATE conversation_turns SET data=? WHERE id=?")
            .bind(serde_json::to_string(&turn)?)
            .bind(&turn.id)
            .execute(&mut *tx)
            .await?;
        sqlx::query("INSERT INTO conversation_inputs(id,session_id,client_input_id,status,turn_id,delivery_mode,data) VALUES(?,?,?,'accepted',?,'queue',?)").bind(&input.id).bind(session).bind(&input.client_input_id).bind(&turn.id).bind(serde_json::to_string(&input)?).execute(&mut *tx).await?;
        sqlx::query("INSERT INTO conversation_items VALUES(?,?,1,?)")
            .bind(&user.id)
            .bind(&turn.id)
            .bind(serde_json::to_string(&user)?)
            .execute(&mut *tx)
            .await?;
        tx.commit().await?;
        Ok(Self {
            store,
            project,
            turn,
        })
    }
    pub async fn call(&self, name: &str, arguments: Value) -> Result<Value> {
        let mut item = self.store.new_item(&self.turn.id, "tool").await?;
        item.status = "running".into();
        item.payload = json!({"name":name,"arguments":display_payload(&arguments),"callId":id(),"attempt":1,"startedAt":now()});
        self.store.put_item(&mut item).await?;
        let result = self
            .store
            .tool(self.project, Some(&self.turn.session_id), name, arguments)
            .await?;
        if name == "run_workflow" {
            self.store
                .link_turn_run(
                    &self.turn.id,
                    result["id"].as_str().ok_or_else(|| {
                        Error::Execution("Initial run did not return an identity".into())
                    })?,
                )
                .await?;
        }
        item.status = "completed".into();
        item.payload["result"] = display_payload(&result);
        item.payload["isError"] = json!(false);
        item.payload["endedAt"] = json!(now());
        self.store.put_item(&mut item).await?;
        Ok(result)
    }
    pub async fn run(&self, workflow: &str, inputs: Value) -> Result<Value> {
        let run = self
            .call(
                "run_workflow",
                json!({"workflowId":workflow,"inputs":inputs}),
            )
            .await?;
        let run_id = run["id"].as_str().unwrap();
        tokio::time::timeout(std::time::Duration::from_secs(60), async {
            // The status row is committed before the final event. Capture the
            // walkthrough only after the owned worker has flushed the trace.
            while self.store.run(run_id).await?.status == "running"
                || self.store.active.lock().await.contains_key(run_id)
            {
                tokio::time::sleep(std::time::Duration::from_millis(5)).await;
            }
            self.call("get_run", json!({"runId":run_id})).await
        })
        .await
        .map_err(|_| Error::Execution("Initial example execution timed out".into()))?
    }
    pub async fn finish(self, text: String) -> Result<()> {
        let mut item = self.store.new_item(&self.turn.id, "assistant").await?;
        item.status = "completed".into();
        item.phase = "final".into();
        item.content = text;
        self.store.put_item(&mut item).await?;
        self.store
            .finish_turn_success(&self.turn.id, Some(&item.id))
            .await?;
        Ok(())
    }
}
