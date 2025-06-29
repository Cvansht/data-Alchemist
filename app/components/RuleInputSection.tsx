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
  const [groupTag, setGroupTag] = useState("");
  const [minCommonSlots, setMinCommonSlots] = useState("");
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState("");
  const [phaseTaskId, setPhaseTaskId] = useState("");
  const [allowedPhases, setAllowedPhases] = useState("");
  const [nlInput, setNlInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleAdd = () => {
    let rule: Rule;

    if (selectedRuleType === "coRun") {
      const tasks = taskIds.split(",").map((t) => t.trim());
      rule = { type: "coRun", config: { tasks } };
    } else if (selectedRuleType === "slotRestriction") {
      rule = {
        type: "slotRestriction",
        config: {
          group: groupTag,
          minCommonSlots: Number(minCommonSlots),
        },
      };
    } else if (selectedRuleType === "loadLimit") {
      rule = {
        type: "loadLimit",
        config: {
          group: groupTag,
          maxSlotsPerPhase: Number(maxSlotsPerPhase),
        },
      };
    } else if (selectedRuleType === "phaseWindow") {
      rule = {
        //@ts-ignore
        type: "phaseWindow",
        config: {
          task: phaseTaskId,
          allowedPhases: allowedPhases.split(",").map((p) => Number(p.trim())),
        },
      };
    } else {
      alert("Other rule types coming soon.");
      return;
    }

    onAddRule(rule);
    setTaskIds("");
    setGroupTag("");
    setMinCommonSlots("");
    setMaxSlotsPerPhase("");
    setPhaseTaskId("");
    setAllowedPhases("");
  };

  const handleNL = async () => {
    setIsParsing(true);
    const rule = await parseNaturalRule(nlInput);
    setIsParsing(false);

    if (!rule) {
      setParseError("Couldn't understand the rule. Try rephrasing.");
      return;
    }

    setParseError("");
    onAddRule(rule);
    setNlInput("");
  };

  return (
    <div className="mt-8 border border-slate-700 rounded p-6 space-y-4 bg-slate-900 text-white">
      <h2 className="font-semibold text-xl text-purple-400 flex items-center gap-2">
        🧠 Add Rule
      </h2>

      <div className="space-y-2">
        <label className="block text-sm text-slate-300 font-medium">Rule Type:</label>
        <select
          className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
          value={selectedRuleType}
          onChange={(e) => setSelectedRuleType(e.target.value)}
        >
          <option value="coRun">Co-run</option>
          <option value="slotRestriction">Slot Restriction</option>
          <option value="loadLimit">Load Limit</option>
          <option value="phaseWindow">Phase Window</option>
        </select>
      </div>

      {selectedRuleType === "coRun" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Task IDs (comma separated):</label>
          <input
            className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
            value={taskIds}
            onChange={(e) => setTaskIds(e.target.value)}
          />
        </div>
      )}

      {(selectedRuleType === "slotRestriction" || selectedRuleType === "loadLimit") && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Group Tag:</label>
          <input
            className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
            value={groupTag}
            onChange={(e) => setGroupTag(e.target.value)}
          />
        </div>
      )}

      {selectedRuleType === "slotRestriction" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Min Common Slots:</label>
          <input
            type="number"
            className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
            value={minCommonSlots}
            onChange={(e) => setMinCommonSlots(e.target.value)}
          />
        </div>
      )}

      {selectedRuleType === "loadLimit" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Max Slots Per Phase:</label>
          <input
            type="number"
            className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
            value={maxSlotsPerPhase}
            onChange={(e) => setMaxSlotsPerPhase(e.target.value)}
          />
        </div>
      )}

      {selectedRuleType === "phaseWindow" && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Task ID:</label>
            <input
              className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
              value={phaseTaskId}
              onChange={(e) => setPhaseTaskId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Allowed Phases (comma separated):</label>
            <input
              className="border border-slate-700 bg-slate-800 text-white rounded p-2 w-full"
              value={allowedPhases}
              onChange={(e) => setAllowedPhases(e.target.value)}
            />
          </div>
        </>
      )}

      <Button onClick={handleAdd} className="bg-blue-600 text-white">
        ➕ Add Rule
      </Button>

      <div className="border-t border-slate-700 pt-4">
        <h2 className="font-semibold text-md text-slate-200 mb-1">
          Or describe a rule in English:
        </h2>
        <Textarea
          placeholder="e.g. 'Run tasks T1 and T3 together'"
          value={nlInput}
          onChange={(e) => setNlInput(e.target.value)}
          rows={2}
          className="bg-slate-800 border border-slate-700 text-white"
        />
        <Button
          disabled={isParsing || !nlInput}
          onClick={handleNL}
          className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isParsing ? "Parsing…" : "✨ Convert & Add Rule"}
        </Button>
        {parseError && <p className="text-red-500 mt-2 text-sm">{parseError}</p>}
      </div>
    </div>
  );
}
