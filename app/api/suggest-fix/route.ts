// File: app/api/suggest-fix/route.ts

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
    const { row, entity, errors } = await req.json();

    // Input validation
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      return NextResponse.json(
        { error: "Missing or invalid 'row' in request body. Must be an object." },
        { status: 400 }
      );
    }
    if (!entity || typeof entity !== "string" || entity.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'entity' in request body. Must be a non-empty string." },
        { status: 400 }
      );
    }
    if (!errors || !Array.isArray(errors)) {
      return NextResponse.json(
        { error: "Missing or invalid 'errors' in request body. Must be an array." },
        { status: 400 }
      );
    }

    const prompt = `
You are a data cleaner for a scheduling system. Given a data row of type "${entity}" and a list of validation errors, return a corrected version of the row in valid JSON.

Only fix what's wrong based on the error messages. Keep all existing fields that are not mentioned in the errors. The output must be a complete JSON object representing the fixed row, not just the fixed fields.

Row:
${JSON.stringify(row, null, 2)}

Errors:
${errors.map((e: any) => `- ${e.field}: ${e.message}`).join("\n")}

Return corrected JSON object only, with no explanations or markdown:
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    // Extract text from the first candidate
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let fixedRow: object = row;
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        fixedRow = parsed;
      } else {
        console.warn(
          "Gemini returned an invalid JSON type (expected object). Returning original row as fallback.",
          parsed
        );
      }
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini response as JSON for fix suggestion:",
        parseError
      );
    }

    return NextResponse.json({ fixed: fixedRow });
  } catch (err) {
    console.error("Fix Suggestion Error (Gemini):", err);
    return NextResponse.json(
      { error: "Could not generate fix due to an internal server error." },
      { status: 500 }
    );
  }
}
