
import connectdb from "@/app/config/db";
import mineemission from "../../Models/Mineemission";
import User from "../../Models/User"; 
import jwt from "jsonwebtoken"; 
import { soilPractices } from "../../utils/soilpractices";
import { emissionFactors } from "@/app/utils/emissionfactors";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ GET route - fetch baseline emission
export async function GET(req) {
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
      return NextResponse.json({ error: "Mine ID missing" }, { status: 400 });
    }

    const mine = await mineemission.findById(mineId);
    if (!mine) {
      return NextResponse.json({ error: "Mine emission not found" }, { status: 404 });
    }

    return NextResponse.json({ totalemission: mine.totalemission,
                              netemission:mine.netemission

                             },
                            { status: 200 });
  } catch (err) {
    console.log( err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(req) {
  await connectdb();

  try {
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing from token" }, { status: 401 });
    }

    
    const {
      dieselconsumption,
      electricityusage,
      vehiclemovement,
      coalproduction,
      methanerelease,
      totalworkers,
      minetype,
      carbonsinks,
    } = await req.json();

    if (
      !dieselconsumption ||
      !electricityusage ||
      !vehiclemovement ||
      !coalproduction ||
      !methanerelease ||
      !totalworkers ||
      !minetype ||
      !carbonsinks
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const normalizedMinetype = minetype.toLowerCase();

    
    const dieselemission = dieselconsumption * emissionFactors.diesel;
    const electricityemission = electricityusage * emissionFactors.electricity;
    const vehicleemission = vehiclemovement * emissionFactors.vehicle;
    const methaneemission = methanerelease * emissionFactors.methane;
    const coalemission = coalproduction * emissionFactors.coalProduction;

    const totalemission =
      dieselemission +
      electricityemission +
      vehicleemission +
      methaneemission +
      coalemission;

  
    let totalcarbonsink = 0;
    carbonsinks.forEach((sink) => {
      const area = sink.area || 0;
      if (sink.sinktype === "Afforestation" || sink.sinktype === "Rehabilitation") {
        totalcarbonsink += area * (sink.sequestrationrate || 0);
      } else if (sink.sinktype === "Soilcarbon") {
        const practicerate = soilPractices[sink.soilmanagementpractices?.trim()] || 0;
        totalcarbonsink += area * practicerate;
      }
    });

    
    const netemission = totalemission - totalcarbonsink;
    const percaptaemission = netemission / totalworkers;

    let status = "Green";
    if (netemission > 500000) status = "Red ! Critical";
    else if (netemission > 100000) status = "Yellow ! Pay Attention";

    // 6️⃣ Create Mine Record
    const mine = await mineemission.create({
      dieselconsumption,
      electricityusage,
      vehiclemovement,
      coalproduction,
      methanerelease,
      totalworkers,
      minetype: normalizedMinetype,
      carbonsinks,
      totalemission,
      netemission,
      userId,
    });

    //  Update user's mineId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { mineid: mine._id },
      { new: true }
    );

    // Generate a NEW token including mineid
    const newToken = jwt.sign(
      {
        id: updatedUser._id,
        role: updatedUser.role,
        email: updatedUser.email,
        mineid: updatedUser.mineid,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 9 Respond with data + new token
    return NextResponse.json(
      {
        message: "Mine Emission calculated and stored successfully",
        token: newToken,
        dieselemission,
        electricityemission,
        vehicleemission,
        methaneemission,
        coalemission,
        totalemission,
        totalcarbonsink,
        netemission,
        percaptaemission,
        status,
        mineId: mine._id,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error( err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
