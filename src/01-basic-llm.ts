import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";

const llm = new ChatOpenRouter({
  model: process.env.OPENROUTER_MODEL!,
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const result = await llm.invoke(
  "Suggest three small business ideas."
);

console.log(result.content);
