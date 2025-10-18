
import scenariomodel from '../../Models/Scenario';
import mineform from '../../Models/Mineemission';
import connectdb from '@/app/config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectdb();

  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No token provided" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const mineid = decoded.mineid;

    if (!mineid) {
      return new Response(
        JSON.stringify({ error: "Mine ID not found in token" }),
        { status: 400 }
      );
    }

    // 2️⃣ Parse request body
    const body = await req.json();
    const {
      dieselreduction,
      methanecapture,
      renewableenergyusage,
      additionalafforestation,
      evadoption,
      baselinemission: manualBaseline, // optional from frontend
    } = body;

    // 3️⃣ Fetch mine details from DB
    const mine = await mineform.findById(mineid);

    // 4️⃣ Determine baseline emission
    let baselinemission;
    if (manualBaseline) {
      baselinemission = manualBaseline;
    } else if (mine && mine.totalemission) {
      baselinemission = mine.totalemission;
    } else {
      return new Response(
        JSON.stringify({
          error:
            "Baseline emission not available. Please enter manually or fill Mine Emission form first.",
        }),
        { status: 400 }
      );
    }

    // 5️⃣ Perform calculations
    const newemission =
      baselinemission - dieselreduction - methanecapture - renewableenergyusage;
    const carbonsink = additionalafforestation + evadoption;
    const netemissionreduction = baselinemission - (newemission - carbonsink);

    // 6️⃣ Determine status message
    let statusmsg = "";
    if (netemissionreduction === 0) {
      statusmsg =
        "No reduction achieved. Implement mitigation measures: increase renewable energy usage, improve methane capture, and expand afforestation.";
    } else if (netemissionreduction >= 50) {
      statusmsg =
        "Excellent! Major emission reduction achieved. Maintain current strategies and consider scaling up afforestation or EV adoption for further gains.";
    } else if (netemissionreduction >= 20) {
      statusmsg =
        "Good progress. Moderate reduction achieved. Focus on increasing diesel reduction, methane capture, and afforestation.";
    } else {
      statusmsg =
        "Minimal reduction. More actions needed. Increase efforts in renewable energy, diesel reduction, methane capture, and afforestation to achieve meaningful impact.";
    }

    // 7️⃣ Save scenario in database
    const scenario = await scenariomodel.create({
      mineid,
      dieselreduction,
      methanecapture,
      renewableenergyusage,
      additionalafforestation,
      evadoption,
      baselinemission,
      netemissionreduction,
      statusmsg,
    });

    // 8️⃣ Return success response
    return new Response(
      JSON.stringify({
        message: "Scenario form calculated successfully",
        baselinemission,
        newemission,
        carbonsink,
        netemissionreduction,
        statusmsg,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
