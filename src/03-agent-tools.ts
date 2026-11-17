
import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import { createAgent, tool } from "langchain";
import { z } from "zod";

// 1. Define a tool
const calculateRevenue = tool(
  async ({ customers, monthlyPrice }) => {
    console.log("TOOL CALLED: calculateRevenue");

    return String(customers * monthlyPrice);
  },
  {
    name: "calculate_monthly_revenue",
    description: "Calculate monthly business revenue",
    schema: z.object({
      customers: z.number(),
      monthlyPrice: z.number()
    })
  }
);

// 2. Create LLM
const llm = new ChatOpenRouter({
  model: process.env.OPENROUTER_MODEL!
});

// 3. Create agent
const agent = createAgent({
  model: llm,
  tools: [calculateRevenue],
  systemPrompt:
    "You are a business assistant. Use the revenue tool for calculations."
});

// 4. Invoke agent
const result = await agent.invoke({
  messages: [{
    role: "user",
    content:
      "A business has 25 customers paying $20 monthly. Use the tool to calculate revenue."
  }]
});

console.log(result.messages.at(-1)?.content);
