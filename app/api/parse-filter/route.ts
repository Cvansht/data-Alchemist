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

// Known schema fields for fuzzy mapping
const ENTITY_FIELDS: Record<string, string[]> = {
  clients: ["ClientID", "ClientName", "PriorityLevel", "RequestedTaskIDs", "GroupTag", "AttributesJSON"],
  workers: ["WorkerID", "WorkerName", "Skills", "AvailableSlots", "MaxLoadPerPhase", "WorkerGroup", "QualificationLevel"],
  tasks: ["TaskID", "TaskName", "Category", "Duration", "RequiredSkills", "PreferredPhases", "MaxConcurrent"],
};

// simple Levenshtein distance for fuzzy match
function levenshtein(a: string, b: string) {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function resolveField(field: string, schema: string[]): string {
  const lower = field.toLowerCase();
  // exact or case-insensitive
  const exact = schema.find(f => f.toLowerCase() === lower);
  if (exact) return exact;
  // substring
  const substr = schema.find(f => f.toLowerCase().includes(lower));
  if (substr) return substr;
  // fuzzy via Levenshtein
  let best = schema[0];
  let bestScore = Infinity;
  for (const f of schema) {
    const score = levenshtein(lower, f.toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

export async function POST(req: NextRequest) {
  try {
    const { query, entity = "clients" } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'query'" }, { status: 400 });
    }

    const schema = ENTITY_FIELDS[entity] || ENTITY_FIELDS.clients;

    const prompt = `
You are a helpful assistant that converts natural language into structured filter conditions.
Given user input and the list of schema fields, return a JSON array of objects with keys:
  field (one of: ${schema.join(", ")}),
  op (>, <, >=, <=, =),
  value (number or string).
Do fuzzy matching on field names (typos or synonyms) to map to the closest schema field.
Return ONLY valid JSON, no explanations.

Input: "${query}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();

    let filters: any[] = [];
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        // resolve fields to canonical schema
        filters = parsed.map(cond => ({
          field: resolveField(cond.field, schema),
          op: cond.op,
          value: cond.value
        }));
      }
    } catch (parseErr) {
      console.error("Parse Filter response error:", parseErr);
    }

    return NextResponse.json({ filters });
  } catch (err) {
    console.error("Parse Filter API Error:", err);
    return NextResponse.json({ filters: [] }, { status: 500 });
  }
}
