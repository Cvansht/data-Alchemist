import { Rule } from "./rulesTypes";

export async function parseNaturalRule(input: string): Promise<Rule | null> {
  try {
    const res = await fetch("/api/parse-rule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!res.ok) {
      throw new Error("Failed to call GEMINI API route");
    }

    const data = await res.json();

    if (data && data.rule && data.rule.type && data.rule.config) {
      return data.rule;
    }

    return null;
  } catch (err) {
    console.error("parseNaturalRule error:", err);
    return null;
  }
}
