// File: app/api/map-headers/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Init Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!,
});

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error(
    "⚠️ Gemini API key missing. Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local."
  );
}

// Canonical schemas for each entity
const ENTITY_SCHEMAS: Record<string, string[]> = {
  clients: [
    "ClientID",
    "ClientName",
    "PriorityLevel",
    "RequestedTaskIDs",
    "GroupTag",
    "AttributesJSON",
  ],
  workers: [
    "WorkerID",
    "WorkerName",
    "Skills",
    "AvailableSlots",
    "MaxLoadPerPhase",
    "WorkerGroup",
    "QualificationLevel",
  ],
  tasks: [
    "TaskID",
    "TaskName",
    "Category",
    "Duration",
    "RequiredSkills",
    "PreferredPhases",
    "MaxConcurrent",
  ],
};

// Fallback header normalization map (lowercase keys)
const HEADER_MAP: Record<string, string> = {
  clientid: "ClientID",
  clientname: "ClientName",
  prioritylevel: "PriorityLevel",
  requestedtaskids: "RequestedTaskIDs",
  grouptag: "GroupTag",
  attributesjson: "AttributesJSON",
  workerid: "WorkerID",
  workername: "WorkerName",
  skills: "Skills",
  availableslots: "AvailableSlots",
  maxloadperphase: "MaxLoadPerPhase",
  workergroup: "WorkerGroup",
  qualificationlevel: "QualificationLevel",
  taskid: "TaskID",
  taskname: "TaskName",
  category: "Category",
  duration: "Duration",
  requiredskills: "RequiredSkills",
  preferredphases: "PreferredPhases",
  maxconcurrent: "MaxConcurrent",
};

// Normalize headers by stripping whitespace, lowercasing, and mapping via HEADER_MAP
function normalizeHeaders(raw: string[]): string[] {
  const seen: Record<string, number> = {};
  return raw.map((h) => {
    const key = h.replace(/\s+/g, "").toLowerCase();
    // map to canonical if possible
    const base = HEADER_MAP[key] || h;
    // track duplicates
    seen[base] = (seen[base] || 0) + 1;
    return seen[base] > 1 ? `${base}_${seen[base]}` : base;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { headers, sampleRow, entity } = await req.json();

    if (!Array.isArray(headers) || !headers.length) {
      return NextResponse.json(
        { error: "Missing or invalid 'headers'" },
        { status: 400 }
      );
    }

    if (!entity || typeof entity !== "string" || !ENTITY_SCHEMAS[entity]) {
      return NextResponse.json(
        { error: "Invalid or missing entity type" },
        { status: 400 }
      );
    }

    const schemaFields = ENTITY_SCHEMAS[entity];

    // Build AI prompt for header mapping
    const prompt = `
You are a smart CSV column remapper. The user uploaded a file with the following column headers:

${JSON.stringify(headers)}

The expected schema for entity type "${entity}" is:
${JSON.stringify(schemaFields)}

Additionally, here’s a sample data row from the uploaded file:
${
      sampleRow ? JSON.stringify(sampleRow) : "(not provided)"
    }

Your task is to remap the uploaded headers to the most likely canonical fields (from the schema), based on header names and sample row values.

Return ONLY a JSON array like:
["ClientID", "PriorityLevel", "RequestedTaskIDs", ...]

⚠️ Do NOT return explanations or markdown formatting.
`;

    // Call AI
    const res = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const raw =
      res.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    // Start with fallback normalized headers
    let mappedHeaders = normalizeHeaders(headers);

    // Try to parse AI output
    try {
      const parsed = JSON.parse(clean);
      if (
        Array.isArray(parsed) &&
        parsed.every((h) => typeof h === "string")
      ) {
        // Only accept those matching schema
        mappedHeaders = parsed.map((h: string) =>
          schemaFields.includes(h) ? h : HEADER_MAP[h.toLowerCase()] || h
        );
      } else {
        console.warn(
          "⚠️ Unexpected Gemini structure. Using fallback normalized headers."
        );
      }
    } catch (err) {
      console.warn(
        "⚠️ Gemini JSON parsing failed. Using fallback normalized headers.",
        err
      );
    }

    return NextResponse.json({ mappedHeaders });
  } catch (err) {
    console.error("Header Mapping Error:", err);
    return NextResponse.json(
      { mappedHeaders: [], error: "Internal error in header mapping." },
      { status: 500 }
    );
  }
}
