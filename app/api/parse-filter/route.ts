// File: app/api/parse-filter/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!,
});

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error(
    "⚠️ No Gemini API key found. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env.local file."
  );
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' in request body." },
        { status: 400 }
      );
    }

    const prompt = `
You are a natural language filter interpreter.
Given the user's input, extract conditions for filtering tabular data.
Return ONLY an array of objects like this:
[
  { "field": "PriorityLevel", "op": ">", "value": 3 }
]

Allowed operators: >, <, >=, <=, =
No explanation or formatting, just valid JSON array.

Input:
${query}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let filters: any[] = [];
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        filters = parsed;
      } else {
        console.warn("Unexpected filter format returned:", parsed);
      }
    } catch (parseErr) {
      console.error("Failed to parse filter response:", parseErr);
    }

    return NextResponse.json({ filters });
  } catch (err) {
    console.error("Parse Filter API Error (Gemini):", err);
    return NextResponse.json({ filters: [] }, { status: 500 });
  }
}
