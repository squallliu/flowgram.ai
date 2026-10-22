use flowgram_desktop_backend::{store::Store, tools};
use serde_json::{Value, json};

fn graph() -> Value {
    json!({"nodes":[
        {"id":"start","type":"start","meta":{"position":{"x":5000,"y":5000}},"data":{"title":"Input"}},
        {"id":"end","type":"end","meta":{"position":{"x":-1000,"y":0}},"data":{"inputsValues":{"result":{"type":"constant","content":"unchanged"}}}}
    ],"edges":[{"sourceNodeID":"start","targetNodeID":"end"}]})
}
fn x(graph: &Value, id: &str) -> f64 {
    graph["nodes"]
        .as_array()
        .unwrap()
        .iter()
        .find(|n| n["id"] == id)
        .unwrap()["meta"]["position"]["x"]
        .as_f64()
        .unwrap()
}

#[tokio::test]
async fn shared_tools_arrange_creation_and_structural_saves_but_preserve_parameter_edit_positions()
{
    let dir = tempfile::tempdir().unwrap();
    let store = Store::open(dir.path()).await.unwrap();
    let project = store.projects().await.unwrap().remove(0);
    let created = store
        .tool(
            &project.id,
            None,
            "create_workflow",
            json!({"name":"Generated draft","schema":graph()}),
        )
        .await
        .unwrap();
    let id = created["id"].as_str().unwrap();
    assert!(x(&created["schema"], "end") > x(&created["schema"], "start"));
    let manual = graph();
    store
        .save_workflow(id, 1, "Manually arranged", manual.clone())
        .await
        .unwrap();
    let mut changed = manual.clone();
    changed["nodes"][0]["meta"]["position"] = json!({"x":0,"y":0});
    changed["nodes"][1]["data"]["inputsValues"]["result"]["content"] = json!("updated");
    let saved = store
        .tool(
            &project.id,
            None,
            "save_workflow",
            json!({"workflowId":id,"revision":2,"name":"Updated parameter","schema":changed}),
        )
        .await
        .unwrap();
    assert_eq!(x(&saved["schema"], "start"), 5000.0);
    assert_eq!(x(&saved["schema"], "end"), -1000.0);
    let mut changed = saved["schema"].clone();
    changed["nodes"]
        .as_array_mut()
        .unwrap()
        .push(json!({"id":"step","type":"assign","data":{"title":"New step"}}));
    changed["edges"] = json!([{"sourceNodeID":"start","targetNodeID":"step"},{"sourceNodeID":"step","targetNodeID":"end"}]);
    let saved = store
        .tool(
            &project.id,
            None,
            "save_workflow",
            json!({"workflowId":id,"revision":3,"name":"New structure","schema":changed}),
        )
        .await
        .unwrap();
    assert!(x(&saved["schema"], "start") < x(&saved["schema"], "step"));
    assert!(x(&saved["schema"], "step") < x(&saved["schema"], "end"));
    assert_eq!(
        saved["schema"]["nodes"][1]["data"]["inputsValues"]["result"]["content"],
        "updated"
    );
    assert_eq!(store.workflow(id).await.unwrap().schema, saved["schema"]);
}

#[tokio::test]
async fn explicit_layout_is_a_revision_checked_persistent_tool_that_only_changes_positions() {
    let dir = tempfile::tempdir().unwrap();
    let store = Store::open(dir.path()).await.unwrap();
    let project = store.projects().await.unwrap().remove(0);
    let workflow = store
        .create_workflow(&project.id, "Disorganized draft", graph())
        .await
        .unwrap();
    assert!(
        tools::definitions()
            .as_array()
            .unwrap()
            .iter()
            .any(|tool| tool["name"] == "layout_workflow")
    );
    let args = json!({"workflowId":workflow.id,"revision":1});
    let arranged = store
        .tool(&project.id, None, "layout_workflow", args.clone())
        .await
        .unwrap();
    assert_eq!(arranged["revision"], 2);
    assert!(x(&arranged["schema"], "end") > x(&arranged["schema"], "start"));
    assert_eq!(arranged["schema"]["edges"], workflow.schema["edges"]);
    assert_eq!(
        arranged["schema"]["nodes"][1]["data"],
        workflow.schema["nodes"][1]["data"]
    );
    assert!(
        store
            .tool(&project.id, None, "layout_workflow", args)
            .await
            .is_err()
    );
    assert_eq!(store.workflow(&workflow.id).await.unwrap().revision, 2);
    assert!(
        store
            .tool(
                "foreign-project",
                None,
                "layout_workflow",
                json!({"workflowId":workflow.id,"revision":2})
            )
            .await
            .is_err()
    );
}
