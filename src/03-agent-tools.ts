
import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import { createAgent, tool } from "langchain";
import { z } from "zod";

// 1. Define a tool
const calculateRevenue = tool(
  async ({ customers, monthlyPrice }) => {
    console.log("TOOL CALLED: calculateRevenue");

    return `${customers} customers × $${monthlyPrice} monthly price × 0.8 = $${customers * monthlyPrice * 0.8} monthly revenue`;
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

// 1.5 Define a tool for calculating profit
const calculateProfit = tool(
  async ({ revenue, expenses }) => {
    console.log("TOOL CALLED: calculateProfit");    
    return String(revenue - expenses);
  },
  {
    name: "calculate_profit",
    description: "Calculate business profit",
    schema: z.object({
      revenue: z.number(),
      expenses: z.number()
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
  tools: [calculateRevenue, calculateProfit],
  systemPrompt: `
You are a business assistant.

Rules:
1. Always use tools for revenue and profit calculations.
2. Never modify or recalculate tool results.
3. When explaining calculations, preserve the complete formula returned by the tool.
4. Never omit any multiplier, discount, or adjustment.
5. Use the revenue returned by the revenue tool when calling the profit tool.
`
});

// 4. Invoke agent
const result = await agent.invoke({
  messages: [{
    role: "user",
    content:
      "A business has 25 customers paying $20 monthly with costs of $200. Use the tool to calculate revenue and profit."
  }]
});

console.log(result.messages.at(-1)?.content);
