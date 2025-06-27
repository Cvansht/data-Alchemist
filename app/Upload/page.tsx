"use client";
import { useState } from "react";
import FileUploader from "../components/FileUploader";
import DataGrid from "../components/DataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { validateClients } from "@/lib/validators";
import RuleInputSection from "../components/RuleInputSection";
import { Rule } from "@/lib/rulesTypes";
import { suggestRulesFromClients } from "@/lib/aiSuggest";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const [datasets, setDatasets] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleSuggestions, setRuleSuggestions] = useState<Rule[]>([]);

  const addRule = (rule: Rule) => {
    setRules(prev => [...prev, rule]);
  };

  const handleDataParsed = (type: string, data: any[]) => {
    setDatasets(prev => ({ ...prev, [type]: data }));

    if (type === "clients") {
      setValidationErrors(validateClients(data));
      setRuleSuggestions(suggestRulesFromClients(data));
    }
  };

  const exportRules = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rules.json";
    a.click();
  };

  const renderGrid = (label: string, data: any[]) => {
    const columns: ColumnDef<any>[] = Object.keys(data[0] || {}).map(key => ({
      accessorKey: key,
      header: key,
      cell: info => info.getValue(),
    }));

    return (
      <div key={label} className="mb-8">
        <h2 className="text-lg font-semibold mb-2 capitalize">{label}</h2>
        <DataGrid
          data={data}
          columns={columns}
          entity={label as any}
          errors={validationErrors}
        />
      </div>
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Alchemist</h1>
      <FileUploader onDataParsed={handleDataParsed} />

      {ruleSuggestions.length > 0 && (
        <div className="mt-6 border p-4 rounded bg-blue-50">
          <h2 className="font-semibold mb-2">AI Rule Suggestions:</h2>
          {ruleSuggestions.map((sug, i) => (
            <div key={i} className="border p-2 rounded bg-white mb-2">
              <pre>{JSON.stringify(sug, null, 2)}</pre>
              <button onClick={() => addRule(sug)} className="mt-1 text-sm underline text-blue-600">
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {Object.entries(datasets).map(([k, d]) => renderGrid(k, d))}

      <RuleInputSection onAddRule={addRule} />

      {rules.length > 0 && (
        <div className="mt-6 border p-4 rounded bg-blue-50">
          <h2 className="font-semibold mb-2">Defined Rules:</h2>
          {rules.map((r, i) => (
            <pre key={i}>{JSON.stringify(r, null, 2)}</pre>
          ))}
          <Button onClick={exportRules}>Export Rules Config</Button>
        </div>
      )}
    </main>
  );
}
