import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", "http://localhost:3000"));

  response.cookies.set("neotravel_session", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}