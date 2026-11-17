
import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import {
  StateGraph,
  Annotation,
  START,
  END
} from "@langchain/langgraph";

// 1. Shared state
const State = Annotation.Root({
  topic: Annotation<string>(),
  draft: Annotation<string>(),
  round: Annotation<number>()
});

const llm = new ChatOpenRouter({
  model: process.env.OPENROUTER_MODEL!
});

// 2. Node
async function generate(state: typeof State.State) {
  const prompt = state.round === 0
    ? `Suggest a business idea about ${state.topic}.`
    : `Improve this business idea and make it more practical:
       ${state.draft}`;

  console.log(`Running round ${state.round + 1}`);

  const response = await llm.invoke(prompt);

  return {
    draft: String(response.content),
    round: state.round + 1
  };
}

// 3. Conditional routing
function route(state: typeof State.State) {
  if (state.round < 2) {
    return "generate";
  }
  return END;
}

// 4. Build graph
const graph = new StateGraph(State)
  .addNode("generate", generate)
  .addEdge(START, "generate")
  .addConditionalEdges("generate", route, [
    "generate",
    END
  ])
  .compile();

// 5. Run
const result = await graph.invoke({
  topic: "AI automation for small businesses",
  draft: "",
  round: 0
});

console.log("Final idea:", result.draft);
console.log("Total rounds:", result.round);
