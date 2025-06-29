// File: app/api/parse-rule/route.ts

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

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'input' in request body. Input must be a non-empty string." },
        { status: 400 }
      );
    }

    const prompt = `
You are a rule and filter parser for a scheduling system. Your goal is to convert user-provided natural language into structured JSON objects or arrays.

Depending on the user input, either:
- If it describes a **rule** for co-running tasks, return a single JSON object with "type": "coRun" and a "config" object containing a "tasks" array. Example:
  { "type": "coRun", "config": { "tasks": ["T1", "T2"] } }

- If it describes a **filter** based on field conditions, return a JSON array of filter objects. Each filter object must have "field", "op" (operator), and "value".
  Allowed operators: "=", ">", "<", ">=", "<="
  Example:
  [{ "field": "PriorityLevel", "op": ">", "value": 3 }]

If you are **unsure** about the input, it is ambiguous, or it does not fit the described rule/filter formats, you **must** return an **empty JSON array**: []

Now parse this input: "${input}"
Return ONLY the JSON output. Do NOT include any extra commentary, markdown formatting, or explanations.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let parsedResult: any = [];
    try {
      const parsed = JSON.parse(cleanText);

      if (Array.isArray(parsed)) {
        // It's a filter (or empty array)
        parsedResult = parsed;
      } else if (
        typeof parsed === 'object' &&
        parsed !== null &&
        parsed.type === 'coRun'
      ) {
        // Wrap single rule in an array so UI can consume it
        parsedResult = [parsed];
      } else {
        console.warn("Gemini returned an unrecognised JSON structure. Returning an empty array as fallback.", parsed);
        parsedResult = [];
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      parsedResult = [];
    }

    if (
      parsedResult.length === 1 &&
      parsedResult[0].type &&
      parsedResult[0].config
    ) {
      return NextResponse.json({ rule: parsedResult[0] });
    }
    
    return NextResponse.json({ rule: null });
  } catch (error) {
    console.error("Parse Rule API Error (Gemini):", error);
    return NextResponse.json(
      { error: "Internal server error. Could not parse rule." },
      { status: 500 }
    );
  }
}
