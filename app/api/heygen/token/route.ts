import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "HEYGEN_API_KEY not configured" }, { status: 500 });
  }

  const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ error: `HeyGen API error: ${text}` }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json({ token: data.data?.token });
}
