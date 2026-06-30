import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  const response = await fetch("https://aymenfeniniche.app.n8n.cloud/webhook-test/neotravel-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  console.log("Réponse brute n8n:", text);
  
  try {
    const data = JSON.parse(text);
    const output = Array.isArray(data) ? data[0]?.assistant_message : data?.assistant_message;
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Erreur de parsing:", error);
    return NextResponse.json({ output: text });
  }
}