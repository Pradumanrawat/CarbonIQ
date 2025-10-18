import { NextResponse } from "next/server";
import User from '../../../Models/User'
 import connectdb from "@/app/config/db";

export async function POST(req) {
    await connectdb();
  try {
    

    const { name, email, phone, password, role, mineName, mineLocation } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Prepare user data
    const userData = { name, email, phone, password, role };

    // Only add mine fields if role is mine manager
    if (role === "mine manager") {
      userData.mineName = mineName;
      userData.mineLocation = mineLocation;
    }

    const newUser = await User.create(userData);

    return NextResponse.json(
        { message: "User created successfully",
         user: newUser
        },
        {status: 200}
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "internal server error " }, { status: 500 });
  }
}
