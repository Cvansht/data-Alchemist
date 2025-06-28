"use client";

import { useState } from "react";

type Props = {
  onChange: (weights: Record<string, number>) => void;
};

export default function PrioritizationPanel({ onChange }: Props) {
  const [weights, setWeights] = useState({
    priority: 5,
    fairness: 5,
    load: 5,
  });

  const handleChange = (field: string, value: number) => {
    const updated = { ...weights, [field]: value };
    setWeights(updated);
    onChange(updated);
  };

  const applyPreset = (preset: "fulfillment" | "fair" | "load") => {
    let newWeights = { priority: 5, fairness: 5, load: 5 };
    if (preset === "fulfillment") newWeights = { priority: 10, fairness: 2, load: 1 };
    if (preset === "fair") newWeights = { priority: 5, fairness: 10, load: 5 };
    if (preset === "load") newWeights = { priority: 2, fairness: 2, load: 10 };
    setWeights(newWeights);
    onChange(newWeights);
  };

  return (
    <div className="mt-6 border rounded p-4 bg-white">
      <h3 className="text-md font-semibold mb-2">⚖️ Prioritization Settings</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">PriorityWeight: {weights.priority}</label>
          <input
            type="range"
            min={0}
            max={10}
            value={weights.priority}
            onChange={(e) => handleChange("priority", parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">FairnessWeight: {weights.fairness}</label>
          <input
            type="range"
            min={0}
            max={10}
            value={weights.fairness}
            onChange={(e) => handleChange("fairness", parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">LoadBalanceWeight: {weights.load}</label>
          <input
            type="range"
            min={0}
            max={10}
            value={weights.load}
            onChange={(e) => handleChange("load", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="font-medium text-sm mb-2">Preset:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => applyPreset("fulfillment")}
            className="border rounded px-2 py-1 text-sm hover:bg-gray-100"
          >
            Maximize Fulfillment
          </button>
          <button
            onClick={() => applyPreset("fair")}
            className="border rounded px-2 py-1 text-sm hover:bg-gray-100"
          >
            Fair Distribution
          </button>
          <button
            onClick={() => applyPreset("load")}
            className="border rounded px-2 py-1 text-sm hover:bg-gray-100"
          >
            Minimize Workload
          </button>
        </div>
      </div>
    </div>
  );
}
