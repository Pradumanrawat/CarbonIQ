
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET; // your secret from .env

// Define protected routes and allowed roles
const protectedRoutes = [
  { path: "/api/CarbonCredit", roles: ["mine manager"] },
  { path: "/api/ScenarioForm", roles: ["mine manager"] },
  { path: "/api/MineEmission", roles: ["mine manager"] },
 // { path: "/api/UserEmssion", roles: ["general user"] },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log("Requested Path:", pathname);

  // Check if route is protected
  const route = protectedRoutes.find((r) => pathname.startsWith(r.path));

  if (!route) {
    console.log("Route not protected. Allowing access.");
    return NextResponse.next();
  }

  console.log("Protected Route matched:", route.path);
  console.log("Allowed roles for this route:", route.roles);

  // Get token from Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided or wrong format.");
    return NextResponse.json({ error: "Unauthorized: Token missing" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // jose expects a Uint8Array key
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);
    console.log("Decoded token:", payload);

    // Check role (case-insensitive)
    const roleAllowed = route.roles.some(
      (r) => r.toLowerCase() === payload.role.toLowerCase()
    );

    if (!roleAllowed) {
      console.log(`Access denied. User role '${payload.role}' not allowed for this route.`);
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    console.log(`Access granted for role '${payload.role}'`);

    

    return NextResponse.next();
  } catch (err) {
    console.log("Token verification failed:", err);
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
  }
}
