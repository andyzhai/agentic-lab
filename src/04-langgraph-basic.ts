
import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import {
  StateGraph,
  Annotation,
  START,
  END
} from "@langchain/langgraph";

// 1. Define state
const BusinessState = Annotation.Root({
  request: Annotation<string>(),
  idea: Annotation<string>(),
  evaluation: Annotation<string>(),
  summary: Annotation<string>()
});

const llm = new ChatOpenRouter({
  model: process.env.OPENROUTER_MODEL!
});

// 2. Node: Generate an idea
async function brainstorm(
  state: typeof BusinessState.State
) {
  console.log("Running brainstorm node");

  const response = await llm.invoke(
    `Suggest one small business idea for: ${state.request}`
  );

  return { idea: String(response.content) };
}

//2.5 Node: evaluate the idea
async function evaluate(
  state: typeof BusinessState.State
) {
  console.log("Running evaluate node");
  // Placeholder for evaluation logic
  const response = await llm.invoke(
    `Evaluate the following business idea:

    ${state.idea}`
  );  
  return {
    evaluation: `Evaluation:\n${response.content}`
  };
}

// 3. Node: Summarize the result
async function summarize(
  state: typeof BusinessState.State
) {
  console.log("Running summarize node");

  const response = await llm.invoke(
    `Summarize the following business idea in 2-3 sentences:

    ${state.idea}`
  );

  return {
    summary: `SUMMARY:\n${response.content}`
  };
}

// 4. Build graph
const graph = new StateGraph(BusinessState)
  .addNode("brainstorm", brainstorm)
  .addNode("evaluate", evaluate)
  .addNode("summarize", summarize)
  .addEdge(START, "brainstorm")
  .addEdge("brainstorm", "evaluate")
  .addEdge("evaluate", "summarize")
  .addEdge("summarize", END)
  .compile();

// 5. Execute graph
const result = await graph.invoke({
  request: "AI automation for small businesses"
});

console.log("\n========== IDEA ==========");
console.log(result.idea);

console.log("\n========== EVALUATION ==========");
console.log(result.evaluation);

console.log("\n========== SUMMARY ==========");
console.log(result.summary);
