"use client";

import { useState } from "react";
import FileUploader from "../components/FileUploader";
import DataGrid from "../components/DataGrid";
import RuleInputSection from "../components/RuleInputSection";
import PrioritizationPanel, { PrioritizationWeights } from "../components/PrioritizationPanel";
import { ColumnDef } from "@tanstack/react-table";
import {
  validateClients,
  validateWorkers,
  validateTasks,
  validateStructure,
  validateCrossReferences,
  validateRules,
} from "@/lib/validators";
import { ValidationError } from "../types/validationTypes";
import { Rule } from "@/lib/rulesTypes";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [parsedFilters, setParsedFilters] = useState<
    { field: string; op: string; value: any }[]
  >([]);
  const [datasets, setDatasets] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [weights, setWeights] = useState<PrioritizationWeights>({
    priorityWeight: 0.4,
    fairnessWeight: 0.3,
    loadBalanceWeight: 0.3,
  });
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const handleDataParsed = (type: string, data: any[]) => {
    const updated = { ...datasets, [type]: data };
    setDatasets(updated);

    let entityErrors: ValidationError[] = [];
    entityErrors.push(...validateStructure(data, type));

    if (type === "clients") entityErrors.push(...validateClients(data));
    if (type === "workers") entityErrors.push(...validateWorkers(data));
    if (type === "tasks") entityErrors.push(...validateTasks(data));

    if (updated.clients && updated.tasks && updated.workers) {
      const crossErrors = validateCrossReferences(
        updated.clients,
        updated.tasks,
        updated.workers
      );
      entityErrors.push(...crossErrors);
    }

    setValidationErrors((prev) => [
      ...prev.filter((e) => e.entity !== type),
      ...entityErrors,
    ]);
  };

  const handleDataUpdate = (type: string, updatedData: any[]) => {
    const updated = { ...datasets, [type]: updatedData };
    setDatasets(updated);

    let entityErrors: ValidationError[] = [];
    if (type === "clients") entityErrors.push(...validateClients(updatedData));
    if (type === "workers") entityErrors.push(...validateWorkers(updatedData));
    if (type === "tasks") entityErrors.push(...validateTasks(updatedData));

    if (updated.clients && updated.tasks && updated.workers) {
      entityErrors.push(
        ...validateCrossReferences(
          updated.clients,
          updated.tasks,
          updated.workers
        )
      );
    }

    setValidationErrors((prev) => [
      ...prev.filter((e) => e.entity !== type),
      ...entityErrors,
    ]);
  };

  const addRule = (rule: Rule) => {
    const newRules = [...rules, rule];
    setRules(newRules);

    const ruleErrors = validateRules(newRules);
    setValidationErrors((prev) => [
      ...prev.filter((e) => e.entity !== "rules"),
      ...ruleErrors,
    ]);
  };

  const handleAISuggestRules = async () => {
    const res = await fetch("/api/suggest-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clients: datasets.clients || [],
        workers: datasets.workers || [],
        tasks: datasets.tasks || [],
      }),
    });

    const result = await res.json();
    if (result.rules) {
      setRules((prev) => [...prev, ...result.rules]);
    } else {
      alert("AI could not suggest any rules.");
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderGrid = (label: string, data: any[]) => {
    if (!data || data.length === 0) return null;

    const columns: ColumnDef<any>[] = Object.keys(data[0] || {}).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => info.getValue(),
    }));

    async function handleNLSearch(query: string) {
      const res = await fetch("/api/parse-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = await res.json();
      setParsedFilters(result.filters || []);
    }

    const updateSearch = (entity: string, query: string) => {
      setSearchQueries((prev) => ({ ...prev, [entity]: query }));
    };

    return (
      <div key={label} className="mb-8">
        <h2 className="text-lg font-semibold mb-2 capitalize">{label}</h2>
        <input
          type="text"
          placeholder="Filter (e.g. PriorityLevel > 3)"
          value={searchQueries[label] ?? ""}
          onChange={(e) => updateSearch(label, e.target.value)}
          onBlur={(e) => handleNLSearch(e.target.value)}
          className="border rounded px-2 py-1 mb-4 w-full"
        />

        <DataGrid
          data={data}
          columns={columns}
          entity={label as "clients" | "workers" | "tasks"}
          errors={validationErrors}
          onDataUpdate={(upd: any) => handleDataUpdate(label, upd)}
          searchQuery={searchQueries[label]}
        />
      </div>
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Upload Clients, Workers, and Tasks
      </h1>

      <FileUploader onDataParsed={handleDataParsed} />

      <div className="mt-6 space-y-6">
        {"clients workers tasks".split(" ").map((key) =>
          datasets[key] ? renderGrid(key, datasets[key]) : null
        )}
      </div>

      <PrioritizationPanel onUpdate={(w) => setWeights(w)} />

      {validationErrors.length > 0 && (
        <div className="mt-6 border p-4 rounded bg-yellow-50">
          <h2 className="font-semibold mb-2">Validation Summary:</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {validationErrors.map((err, i) => (
              <li key={i}>
                <strong>{err.entity}</strong> [Row {err.rowIndex + 1}, Field: {err.field}] - {err.message}
              </li>
            ))}
          </ul>

          <RuleInputSection onAddRule={addRule} />

          <Button
            onClick={handleAISuggestRules}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            ✨ Suggest Rules with AI
          </Button>

          {rules.length > 0 && (
            <div className="mt-6 border p-4 rounded bg-blue-50">
              <h2 className="font-semibold mb-2">Defined Rules:</h2>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {rules.map((rule, i) => (
                  <li key={i}>
                    <code>{JSON.stringify(rule)}</code>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  downloadJSON(
                    [...rules, { type: "weights", config: weights }],
                    "rules.json"
                  )
                }
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Export Rules
              </Button>
            </div>
          )}
        </div>
      )}

      {Object.entries(datasets).length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Export Cleaned Data</h2>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(datasets).map(([type, data]) => (
              <Button
                key={type}
                onClick={() => downloadJSON(data, `${type}_cleaned.json`)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Export {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}

            {validationErrors.length > 0 && (
              <Button
                onClick={() =>
                  downloadJSON(validationErrors, "validation_errors.json")
                }
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Export Validation Errors
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
