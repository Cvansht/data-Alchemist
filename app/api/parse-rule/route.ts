// File: app/api/parse-rule/route.ts

import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Missing or invalid input" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a rule parser for a scheduling system. Convert user input into a JSON object with type and config properties. Supported types include: coRun, slotRestriction, loadLimit, etc.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Parse Rule API Error:", error);
    return NextResponse.json(
      { error: "Could not parse rule. Please check your input." },
      { status: 500 }
    );
  }
}
