
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import axios from "axios";

// --------------------
// Initialize LLM
// --------------------
const model = new ChatGoogleGenerativeAI({
  model: "models/gemini-2.5-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// --------------------
// Tools
// --------------------
const computeUserEmission = new DynamicStructuredTool({
  name: "computeUserEmission",
  description: "Extract user emission data (distance, vehicle, electricity usage) from text",
  schema: z.object({
    text: z.string().describe("Free-form user text about activities"),
  }),
  func: async ({ text }) => {
    try {
      const activity = {
        activity: "car",
        quantity: 0,
        unit: "km",
        fuelType: "carpetrol",
        electricityUsage: 0,
      };

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
  schema: z.object({
    query: z.string().describe("Topic or question to search online"),
  }),
  func: async ({ query }) => {
    try {
      const response = await axios.post(
        "https://app.tavily.com/search",
        { query, max_results: 3 },
        {
          headers: {
            Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data.results;
      if (!results || results.length === 0) return "No results found.";

      const summary = results
        .map(
          (r, i) =>
            `${i + 1}. **${r.title}**\n${r.url}\n${r.content.slice(0, 200)}...`
        )
        .join("\n\n");

      return `🔎 Top Web Results for "${query}":\n\n${summary}`;
    } catch (err) {
      console.error("WebSearch error:", err.message);
      return "Error occurred while searching the web.";
    }
  },
});




const carboncredit = new DynamicStructuredTool({
  name: "carboncredit",
  description: "Fetch current carbon credit price in $ for a specific country. If unavailable via API, use LLM knowledge to estimate.",
  schema: z.object({
    text: z.string().describe("User input with country/region name or context"),
  }),
  func: async ({ text }) => {
    try {
      // ------------------------------
      // Step 1: Try getting from API
      // ------------------------------
      const response = await axios.get("https://v17.api.carbonmark.com/purchases");
      const data = response.data;

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data from API");
      }

      // Extract all available countries
      const countries = [
        ...new Set(data.map((item) => item.listing?.project?.country).filter(Boolean)),
      ];

      // Normalize input
      const normalizedText = text.toLowerCase().replace(/[^a-z]/g, "");
      const countryMatch = countries.find((c) =>
        normalizedText.includes(c.toLowerCase().replace(/[^a-z]/g, ""))
      );

      // Helper function for LLM fallback
      const askLLMForPrice = async (query) => {
        try {
          const llmResponse = await model.invoke([
            {
              role: "system",
              content: `You are a climate finance assistant. Estimate the latest average carbon credit price in USD for the specified country. If unknown, give the global average range.`,
            },
            {
              role: "user",
              content: query,
            },
          ]);

          return llmResponse.content?.[0]?.text || "No estimate found.";
        } catch (error) {
          console.error("LLM fallback error:", error.message);
          return "Error fetching estimated carbon credit price.";
        }
      };

      // ------------------------------
      // Step 2: API search logic
      // ------------------------------
      if (countryMatch) {
        const filtered = data.filter(
          (item) =>
            item.listing?.project?.country?.toLowerCase() ===
            countryMatch.toLowerCase()
        );

        const prices = filtered.map((item) => parseFloat(item.price)).filter(Boolean);

        if (prices.length > 0) {
          const avgPrice = (
            prices.reduce((a, b) => a + b, 0) / prices.length
          ).toFixed(2);

          return {
            summary: ` Current carbon credit price for ${countryMatch}: $${avgPrice}`,
            data: { price: avgPrice, currency: "$", source: "API" },
          };
        }

        // No price found for this country → fallback to LLM
        const llmPrice = await askLLMForPrice(
          `What is the current carbon credit price for ${countryMatch}?`
        );
        return {
          summary: `⚠️ No API data found for ${countryMatch}. Based on latest knowledge, ${llmPrice}`,
          data: { source: "LLM" },
        };
      }

      // ------------------------------
      // Step 3: No country match → fallback to LLM
      // ------------------------------
      const llmFallback = await askLLMForPrice(
        `What is the current average global carbon credit price?`
      );
      return {
        summary: `No country detected in input. Showing estimated global average price: ${llmFallback}`,
        data: { source: "LLM" },
      };
    } catch (err) {
      console.error("Carbon Credit error:", err.message);

      // Final safety fallback
      const llmBackup = await model.invoke([
        {
          role: "system",
          content: `You are a climate assistant. Estimate current global carbon credit prices in USD.`,
        },
        { role: "user", content: "Provide global average carbon credit price." },
      ]);

      return {
        summary: ` API error occurred. Estimated global average price (from LLM): ${llmBackup.content?.[0]?.text}`,
        data: { source: "LLM" },
      };
    }
  },
});


// --------------------
// Role-specific prompts
// --------------------
const getPromptForRole = (role) => {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("mine")) {
    return ChatPromptTemplate.fromMessages([
      [
        "system",
        `
You are a carbon management assistant for MINE MANAGER.
Your role: ${role}.
- Provide detailed mine emission info and scenario planning.
- Use computeUserEmission, webSearch, and carboncredit tools as needed.
- Give actionable strategies for emission reduction specific to mining operations.
- If asked about role, clearly reply: "You are a Mine Manager."
- Do not discuss unrelated personal emissions unless specifically requested.

Guidelines:
- Provide detailed mine emission info and scenario planning.
- Use computeUserEmission, webSearch, and carboncredit tools as needed.
- Give actionable strategies for emission reduction specific to mining operations.
- If asked about role, clearly reply: "You are a Mine Manager."
- Never ask the user to specify a country. 
- When the user asks about carbon credit prices:
   • Always extract or infer a country name from the message or prior conversation.
   • If no clear country is mentioned, assume "global average carbon price".
   • Use the carboncredit tool and report the result clearly.
- Avoid unrelated personal emission discussions unless requested.
`,
      ],
      ["human", "{input}"],
      ["ai", "{agent_scratchpad}"],
    ]);
  }

  // Default for general user
  return ChatPromptTemplate.fromMessages([
    [
      "system",
      `
You are a carbon footprint assistant for GENERAL USER.
Your role: ${role}.
- Discuss user's personal emissions only.
- Use computeUserEmission tool to extract details.
- Give actionable tips to reduce emissions.
- If asked about mine emissions, respond: "As a general user, you do not have access to mine or advanced system emissions."
- If asked about your role, reply: "You are a General User."
`,
    ],
    ["human", "{input}"],
    ["ai", "{agent_scratchpad}"],
  ]);
};

// --------------------
// Executor Cache
// --------------------
let executorPromises = { generaluser: null, minemanager: null };

// --------------------
// Get Executor by Role
// --------------------
export async function getAgentExecutor(role = "general user") {
  const normalizedRole = role.toLowerCase().replace(/\s/g, "");
  if (executorPromises[normalizedRole]) return executorPromises[normalizedRole];

  const prompt = getPromptForRole(role);
  const tools = [computeUserEmission, webSearch, carboncredit];

  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = await AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    verbose: false,
    maxIterations: 5,
    returnIntermediateSteps: true,
  });

  console.log(`✅ Agent executor initialized for role: ${role}`);
  executorPromises[normalizedRole] = executor;
  return executor;
}
