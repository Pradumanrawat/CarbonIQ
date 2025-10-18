
import connectdb from "@/app/config/db";
import MineForm from "../../Models/Mineemission";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const INDUSTRY_BASELINE = 120000;

export async function POST(req) {
  await connectdb();

  try {
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const mineId = decoded.mineid;

    if (!mineId) {
      return NextResponse.json(
        { error: "Mine ID not found in token. Fill Mine Emission form first." },
        { status: 400 }
      );
    }

    // 2️⃣ Get input from user
    const { carbonPrice } = await req.json();
    if (!carbonPrice) {
      return NextResponse.json(
        { error: "Carbon price is required." },
        { status: 400 }
      );
    }

    // 3️⃣ Fetch mine emission
    const mine = await MineForm.findById(mineId);
    if (!mine) {
      return NextResponse.json(
        { error: "Mine emission record not found. Fill Mine Emission form first." },
        { status: 404 }
      );
    }

    const netEmission = mine.netemission;
    if (netEmission === undefined || netEmission === null) {
      return NextResponse.json(
        { error: "Net emission not recorded. Fill Mine Emission form first." },
        { status: 400 }
      );
    }

    // 4️⃣ Calculate carbon credits
    let reduction, revenue, status, msg;

    if (netEmission < INDUSTRY_BASELINE) {
      reduction = INDUSTRY_BASELINE - netEmission;
      revenue = reduction * carbonPrice;
      status = "Green";
      msg = `You reduced emissions by ${reduction} tCO₂ below baseline. You can earn approx  ₹${revenue} from carbon credits.`;
    } else if (netEmission === INDUSTRY_BASELINE) {
      reduction = 0;
      revenue = 0;
      status = "Yellow";
      msg = `Your emissions are equal to the industry baseline. No credits earned, but you are on industry average.`;
    } else {
      reduction = netEmission - INDUSTRY_BASELINE;
      revenue = reduction * carbonPrice;
      status = "Red";
      msg = `Your emissions are ${reduction} tCO₂ above baseline. You may need to purchase credits worth approx ₹${revenue}.`;
    }

    // 5️⃣ Return response
    return NextResponse.json(
      {
        message: "Carbon credit calculated successfully",
        netEmission,
        baseline: INDUSTRY_BASELINE,
        reduction,
        revenue,
        status,
        msg,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
