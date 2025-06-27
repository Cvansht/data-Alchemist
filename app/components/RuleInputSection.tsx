"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rule } from "@/lib/rulesTypes";
import { parseNaturalRule } from "@/lib/nlpRules";

export default function RuleInputSection({
  onAddRule,
}: {
  onAddRule: (rule: Rule) => void;
}) {
  const [selectedRuleType, setSelectedRuleType] = useState("coRun");
  const [taskIds, setTaskIds] = useState("");

  const [nlInput, setNlInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // Manual Rule Add
  const handleAddManualRule = () => {
    if (selectedRuleType === "coRun") {
      const tasks = taskIds
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      if (tasks.length < 2) {
        alert("Please enter at least two Task IDs for a coRun rule.");
        return;
      }

      const rule: Rule = { type: "coRun", config: { tasks } };
      onAddRule(rule);
      setTaskIds(""); // Clear input
    } else {
      alert("Other rule types coming soon!");
    }
  };

  // AI Rule Add
  const handleNL = async () => {
    setIsParsing(true);
    try {
      const rule = await parseNaturalRule(nlInput);
      if (!rule) {
        setParseError("Couldn't understand the rule. Try rephrasing.");
      } else {
        onAddRule(rule);
        setParseError("");
        setNlInput("");
      }
    } catch (err: any) {
      setParseError("Error: " + err.message);
    }
    setIsParsing(false);
  };

  return (
    <div className="mt-8 border rounded p-4 space-y-6 bg-white">
      <h2 className="font-semibold text-lg">Add Rule</h2>

      {/* Manual Rule Builder */}
      <div className="space-y-2">
        <label className="block font-medium">Rule Type:</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedRuleType}
          onChange={(e) => setSelectedRuleType(e.target.value)}
        >
          <option value="coRun">Co-run</option>
          <option value="slotRestriction" disabled>
            Slot Restriction (Coming soon)
          </option>
          <option value="loadLimit" disabled>
            Load Limit (Coming soon)
          </option>
        </select>

        {selectedRuleType === "coRun" && (
          <div>
            <label className="block font-medium mt-2">
              Task IDs (comma separated):
            </label>
            <Input
              placeholder="T1, T2, T3"
              value={taskIds}
              onChange={(e) => setTaskIds(e.target.value)}
            />
          </div>
        )}

        <Button className="mt-2" onClick={handleAddManualRule}>
          Add Rule
        </Button>
      </div>

      {/* Natural Language Rule Input */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-1">Or describe a rule in English</h3>
        <Textarea
          placeholder="e.g. Tasks T1 and T2 should run together"
          value={nlInput}
          onChange={(e) => setNlInput(e.target.value)}
          rows={2}
        />
        <Button
          className="mt-2"
          disabled={isParsing || !nlInput}
          onClick={handleNL}
        >
          {isParsing ? "Parsing…" : "Convert & Add Rule"}
        </Button>
        {parseError && <p className="text-red-600 mt-2">{parseError}</p>}
      </div>
    </div>
  );
}
