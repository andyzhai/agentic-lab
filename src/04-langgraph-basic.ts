
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

// 3. Node: Format the result
function summarize(
  state: typeof BusinessState.State
) {
  console.log("Running summarize node");

  return {
    summary: `BUSINESS IDEA:\n${state.idea}`
  };
}

// 4. Build graph
const graph = new StateGraph(BusinessState)
  .addNode("brainstorm", brainstorm)
  .addNode("summarize", summarize)
  .addEdge(START, "brainstorm")
  .addEdge("brainstorm", "summarize")
  .addEdge("summarize", END)
  .compile();

// 5. Execute graph
const result = await graph.invoke({
  request: "AI automation for small businesses"
});

console.log(result.summary);
