"use client";

import { useState } from "react";
import FileUploader from "../components/FileUploader";
import DataGrid from "../components/DataGrid";
import RuleInputSection from "../components/RuleInputSection";
import { ColumnDef } from "@tanstack/react-table";
import { validateClients } from "@/lib/validators";
import { ValidationError } from "../types/validationTypes";
import { Rule } from "@/lib/rulesTypes";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [datasets, setDatasets] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);

  // 🔁 Step 1: handle parsing of uploaded file
  const handleDataParsed = (type: string, data: any[]) => {
    setDatasets((prev) => ({ ...prev, [type]: data }));

    let errors: ValidationError[] = [];
    if (type === "clients") {
      errors = validateClients(data);
      console.log("Validation errors:", errors);
    }

    setValidationErrors((prev) => [
      ...prev.filter((e) => e.entity !== type),
      ...errors,
    ]);
  };

  // ✏️ Step 2: handle inline-edited data update
  const handleDataUpdate = (type: string, updatedData: any[]) => {
    setDatasets((prev) => ({ ...prev, [type]: updatedData }));

    if (type === "clients") {
      const errors = validateClients(updatedData);
      setValidationErrors((prev) => [
        ...prev.filter((e) => e.entity !== type),
        ...errors,
      ]);
    }
  };

  const addRule = (rule: Rule) => {
    setRules((prev) => [...prev, rule]);
  };

  // 📤 Step 3: Download helpers
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
    const columns: ColumnDef<any>[] = Object.keys(data[0] || {}).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => info.getValue(),
    }));

    return (
      <div key={label} className="mb-8">
        <h2 className="text-lg font-semibold mb-2 capitalize">{label}</h2>
        <DataGrid
          data={data}
          columns={columns}
          entity={label as "clients" | "workers" | "tasks"}
          errors={validationErrors}
          onDataUpdate={(updated : any) => handleDataUpdate(label, updated)}
        />
      </div>
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Upload Clients, Workers, and Tasks
      </h1>

      {/* File upload */}
      <FileUploader onDataParsed={handleDataParsed} />

      {/* Display DataGrids */}
      <div className="mt-6">
        {Object.entries(datasets).map(([key, data]) =>
          renderGrid(key, data)
        )}
      </div>

      {/* Validation errors and rule creation */}
      {validationErrors.length > 0 && (
        <div className="mt-4 border p-4 rounded bg-yellow-50">
          <h2 className="font-semibold mb-2">Validation Summary:</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {validationErrors.map((err, i) => (
              <li key={i}>
                <strong>{err.entity}</strong> [Row {err.rowIndex + 1}, Field:{" "}
                {err.field}] - {err.message}
              </li>
            ))}
          </ul>

          {/* Rule section */}
          <RuleInputSection onAddRule={addRule} />

          {/* Show saved rules */}
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
                onClick={() => downloadJSON(rules, "rules.json")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Export Rules
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Export cleaned datasets */}
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
