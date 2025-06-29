"use client";

import { useState } from "react";
import { Gauge, Scale, SlidersHorizontal } from "lucide-react";

// Updated to match your preferred dark UI theme

export default function PrioritizationPanel({ onChange }: { onChange: (weights: Record<string, number>) => void }) {
  const [weights, setWeights] = useState({
    priority: 4,
    fairness: 3,
    load: 3,
  });

  const total = weights.priority + weights.fairness + weights.load;

  const handleChange = (key: string, value: number) => {
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    onChange(updated);
  };

  return (
    <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-6 text-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-purple-300 flex items-center gap-2">
        <SlidersHorizontal size={18} /> Prioritization Settings
      </h3>

      <div className="bg-slate-800 border border-slate-600 p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-white flex items-center gap-2">
            <SlidersHorizontal size={16} /> Weight Configuration
          </h4>
          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
            Total: {(total * 10).toFixed(1)}%
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-red-400">
              <Gauge size={14} /> Priority Weight
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={weights.priority}
              onChange={(e) => handleChange("priority", parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="text-right text-xs text-slate-400">{(weights.priority * 10).toFixed(1)}%</div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Scale size={14} /> Fairness Weight
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={weights.fairness}
              onChange={(e) => handleChange("fairness", parseInt(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="text-right text-xs text-slate-400">{(weights.fairness * 10).toFixed(1)}%</div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-blue-400">
              <Scale size={14} /> Load Balance Weight
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={weights.load}
              onChange={(e) => handleChange("load", parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-right text-xs text-slate-400">{(weights.load * 10).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
