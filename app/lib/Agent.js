
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import axios from "axios";

// Function to safely create the LLM model
const getModel = () => {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("⚠️ GOOGLE_API_KEY not found. LLM features will be disabled.");
    return null; // fallback if key missing
  }
  return new ChatGoogleGenerativeAI({
    model: "models/gemini-2.5-flash",
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
  });
};

// Initialize model only when needed
const model = getModel();

// ----------- Tools -------------

const computeUserEmission = new DynamicStructuredTool({
  name: "computeUserEmission",
  description: "Extract user emission data (distance, vehicle, electricity usage) from text",
  schema: z.object({ text: z.string() }),
  func: async ({ text }) => {
    try {
      const activity = { activity: "car", quantity: 0, unit: "km", fuelType: "carpetrol", electricityUsage: 0 };
      const distanceMatch = text.match(/(\d+)\s*(km|kilometers?)/i);
      if (distanceMatch) activity.quantity = parseInt(distanceMatch[1]);
      if (/bus/i.test(text)) activity.activity = "bus";
      else if (/bike/i.test(text)) activity.activity = "bike";
      else if (/metro|ev/i.test(text)) activity.activity = "ev";

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/UserEmssion`,
        {
          totaldistance: activity.quantity,
          vehicletype: activity.fuelType,
          electricityusage: activity.electricityUsage || 0,
          householdmembers: 1,
          renewableusage: 0,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (err) {
      console.error("Error in /api/UserEmission:", err.message);
      return { summary: "Error occurred while fetching emission data." };
    }
  },
});

const webSearch = new DynamicStructuredTool({
  name: "webSearch",
  description: "Search the web for any topic or question",
  schema: z.object({ query: z.string() }),
  func: async ({ query }) => {
    try {
      const response = await axios.post(
        "https://app.tavily.com/search",
        { query, max_results: 3 },
        { headers: { Authorization: `Bearer ${process.env.TAVILY_API_KEY}`, "Content-Type": "application/json" } }
      );
      const results = response.data.results;
      if (!results || results.length === 0) return "No results found.";
      return results.map((r, i) => `${i + 1}. **${r.title}**\n${r.url}\n${r.content.slice(0, 200)}...`).join("\n\n");
    } catch (err) {
      console.error("WebSearch error:", err.message);
      return "Error occurred while searching the web.";
    }
  },
});

const carboncredit = new DynamicStructuredTool({
  name: "carboncredit",
  description: "Fetch current carbon credit price",
  schema: z.object({ text: z.string() }),
  func: async ({ text }) => {
    if (!model) return { summary: "LLM disabled: GOOGLE_API_KEY not set.", data: null };
    try {
      const response = await axios.get("https://v17.api.carbonmark.com/purchases");
      const data = response.data || [];
      const countries = [...new Set(data.map(item => item.listing?.project?.country).filter(Boolean))];
      const normalizedText = text.toLowerCase().replace(/[^a-z]/g, "");
      const countryMatch = countries.find(c => normalizedText.includes(c.toLowerCase().replace(/[^a-z]/g, "")));

      const askLLMForPrice = async (query) => {
        const llmResponse = await model.invoke([
          { role: "system", content: `You are a climate finance assistant. Estimate carbon credit price.` },
          { role: "user", content: query },
        ]);
        return llmResponse?.content?.[0]?.text || "No estimate found.";
      };

      if (countryMatch) {
        const filtered = data.filter(item => item.listing?.project?.country?.toLowerCase() === countryMatch.toLowerCase());
        const prices = filtered.map(item => parseFloat(item.price)).filter(Boolean);
        if (prices.length > 0) {
          const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
          return { summary: `Current carbon credit price for ${countryMatch}: $${avgPrice}`, data: { price: avgPrice, currency: "$", source: "API" } };
        }
        const llmPrice = await askLLMForPrice(`Current carbon credit price for ${countryMatch}?`);
        return { summary: `⚠️ No API data. LLM estimate: ${llmPrice}`, data: { source: "LLM" } };
      }

      const llmFallback = await askLLMForPrice("Current average global carbon credit price?");
      return { summary: `Estimated global average: ${llmFallback}`, data: { source: "LLM" } };
    } catch (err) {
      console.error("Carbon Credit error:", err.message);
      return { summary: "Error fetching carbon credit.", data: null };
    }
  },
});

// --------- Prompt & Executor ---------
const getPromptForRole = (role) => {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes("mine")) {
    return ChatPromptTemplate.fromMessages([
      [
        "system",
        `
You are a carbon management assistant for MINE MANAGER.
Use computeUserEmission, webSearch, and carboncredit tools.
Respond only with mining-related emission info.
`
      ],
      ["human", "{input}"],
      ["ai", "{agent_scratchpad}"],
    ]);
  }
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `
You are a carbon footprint assistant for GENERAL USER.
Use computeUserEmission only.
`
    ],
    ["human", "{input}"],
    ["ai", "{agent_scratchpad}"],
  ]);
};

let executorPromises = {};

export async function getAgentExecutor(role = "general user") {
  const normalizedRole = role.toLowerCase().replace(/\s/g, "");
  if (executorPromises[normalizedRole]) return executorPromises[normalizedRole];

  const prompt = getPromptForRole(role);
  const tools = [computeUserEmission, webSearch, carboncredit];

  if (!model) {
    console.warn(`⚠️ GOOGLE_API_KEY not set. LLM-related tools may fail.`);
  }

  const agent = await createToolCallingAgent({ llm: model, tools, prompt });
  const executor = await AgentExecutor.fromAgentAndTools({ agent, tools, verbose: false, maxIterations: 5, returnIntermediateSteps: true });
  executorPromises[normalizedRole] = executor;
  return executor;
}
