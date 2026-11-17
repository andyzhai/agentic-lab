
import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenRouter({
  model: process.env.OPENROUTER_MODEL!,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a business consultant."],
  ["human", "Suggest 3 {type} business ideas for {location} with a budget of {budget}."]
]);

// LangChain expression language (LCEL)
const chain = prompt.pipe(llm);

const result = await chain.invoke({
  type: "AI-powered",
  location: "Toronto",
  budget: "CAD 1,000"
});

console.log(result.content);
