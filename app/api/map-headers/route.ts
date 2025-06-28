// File: app/api/map-headers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini, explicitly passing the env var
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!,
});

// Ensure the API key is present
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error("⚠️ No Gemini API key found. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env.local file.");
}

console.log("my controller is here");

export async function POST(req: NextRequest) {
  try {
    const { headers, entity } = await req.json();

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'headers' in request body." },
        { status: 400 }
      );
    }
    if (!entity || typeof entity !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'entity' in request body." },
        { status: 400 }
      );
    }

    const prompt = `
You are an intelligent header remapper. Given a list of column headers from a CSV or XLSX file and an expected schema for "${entity}", map each header to the most likely canonical field name.

Return ONLY a valid JSON array of canonical field names in correct order, e.g.:
["ClientID", "PriorityLevel", "RequestedTaskIDs", ...]
Do not include explanations or code formatting like markdown.

Original headers: ${JSON.stringify(headers)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let mappedHeaders: string[] = headers;
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed) && parsed.every((item: any) => typeof item === 'string')) {
        mappedHeaders = parsed;
      } else {
        console.warn("Gemini returned a malformed JSON array or unexpected structure. Falling back to original headers.", parsed);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
    }

    return NextResponse.json({ mappedHeaders });
  } catch (err) {
    console.error("Header Mapping Error (Gemini):", err);
    return NextResponse.json(
      { mappedHeaders: [], error: "Failed to map headers." },
      { status: 500 }
    );
  }
}
