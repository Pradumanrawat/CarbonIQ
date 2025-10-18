

import { NextResponse } from "next/server";
import { getAgentExecutor } from "@/app/lib/Agent";

export async function POST(req) {
  try {
    const { message, role } = await req.json();
console.log(role);
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Optional: role-based filtering
    if (role?.toLowerCase() === "general user" && /mine/i.test(message)) {
      return NextResponse.json({
        output: "Sorry, you don't have access to mine-specific questions.",
      });
    }

    // ✅ Pass the role to getAgentExecutor
    const executor = await getAgentExecutor(role); // <-- fix here
    const result = await executor.invoke({ input: message });

    console.log("agent full response:", result);

    if (result.output && result.output !== "Agent stopped due to max iterations.") {
      return NextResponse.json({ output: result.output });
    }

    // fallback intermediateSteps
    let answer = null;
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      for (const step of result.intermediateSteps) {
        if (step.observation?.summary) {
          answer = step.observation.summary;
          break;
        } else if (step.observation?.tool_calls?.length > 0) {
          answer = step.observation.tool_calls[0].name + " executed";
          break;
        }
      }
    }

    if (answer) return NextResponse.json({ output: answer });

    return NextResponse.json({ message: "Agent could not find valid answer." });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
