import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || "Utilisateurs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const formula = `AND({Email}="${email}", {Password}="${password}", {Role}="direction", {Actif}="true")`;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    USERS_TABLE
  )}?filterByFormula=${encodeURIComponent(formula)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  console.log(data);
console.log(formula);

  if (!data.records || data.records.length === 0) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("neotravel_session", "direction", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4,
  });

  return response;
}