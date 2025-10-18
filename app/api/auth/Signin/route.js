import { NextResponse } from "next/server";
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import User from '../../../Models/User'
import connectdb from "@/app/config/db";

const JWT_SECRET = process.env.JWT_SECRET 

export async function POST(req) {
    await connectdb();
  try {
    

    const { role, email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
       if (user.role !== role) {
            return NextResponse.json(
                { error: `User cannot login as "${role}". Use correct role.` },
                { status: 403 }
            );
        }

          const payload = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    // ✅ Add mineid only if the user is a mine manager
    if (user.role === "mine manager" && user.mineid) {
      payload.mineid = user.mineid;
    }

    // Generate JWT token

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    
    console.log(jwt.decode(token));

    // Return user data + token
    return NextResponse.json({ message: "Login successful",
       token,
        user:{
          id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mineid: user. mineid
        }
       }
      
      );
      
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
