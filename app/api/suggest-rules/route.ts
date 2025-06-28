// File: app/api/suggest-rules/route.ts

import { NextRequest, NextResponse } from "next/server";
// Use the new, official client library for Gemini
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini, explicitly passing the env var
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!,
});

// It's good practice to ensure the API key is present
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error("⚠️ No Gemini API key found. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env.local file.");
}

console.log("my controller is here");

export async function POST(req: NextRequest) {
  try {
    const { clients, workers, tasks } = await req.json();

    // Input validation: Ensure that 'clients', 'workers', and 'tasks' are arrays.
    if (!Array.isArray(clients) || !Array.isArray(workers) || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid input: 'clients', 'workers', and 'tasks' must all be arrays." },
        { status: 400 }
      );
    }

    const prompt = `
You are a scheduling assistant. Your goal is to suggest helpful business rules based on provided data.

Given the following datasets for clients, workers, and tasks, suggest relevant business rules in valid JSON format.

Use the following rule types where applicable:
- "coRun": Specifies tasks that must run concurrently.
- "slotRestriction": Restricts a task to specific time slots or days.
- "loadLimit": Limits the workload for a worker or resource.
- "phaseWindow": Defines time windows for different phases of a project.

⚠️ The output MUST be a **pure JSON array** of rule objects. Do NOT include any explanations, introductory text, or markdown formatting.

Clients:
${JSON.stringify(clients, null, 2)}

Workers:
${JSON.stringify(workers, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}

Suggested rules (JSON array only):
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    // Extract the generated text from the first candidate
    const rawText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip any markdown formatting
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let suggestedRules: any[] = [];
    try {
      const parsed = JSON.parse(cleanText);
      suggestedRules = Array.isArray(parsed) ? parsed : [];
      if (!Array.isArray(parsed)) {
        console.warn(
          "Gemini returned a non-array response; defaulting to an empty array.",
          parsed
        );
      }
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini response as JSON for rule suggestions:",
        parseError
      );
    }

    return NextResponse.json({ rules: suggestedRules });
  } catch (err) {
    console.error("Gemini Rule Suggestion Error:", err);
    return NextResponse.json(
      { rules: [], error: "Could not generate rules due to an internal server error." },
      { status: 500 }
    );
  }
}
