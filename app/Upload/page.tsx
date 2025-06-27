"use client";

import { useState } from "react";
import FileUploader from "../components/FileUploader";
import DataGrid from "../components/DataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { validateClients } from "@/lib/validators";
import { ValidationError } from "../types/validationTypes";

export default function UploadPage() {
  const [datasets, setDatasets] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleDataParsed = (type: string, data: any[]) => {
    setDatasets((prev) => ({ ...prev, [type]: data }));

    let errors: ValidationError[] = [];

    if (type === "clients") {
        errors = validateClients(data);
        console.log("Validation errors:", errors);
      }
      

    // Add new errors while keeping others
    setValidationErrors((prev) => [
      ...prev.filter((e) => e.entity !== type),
      ...errors,
    ]);
  };

  const renderGrid = (label: string, data: any[]) => {
    const columns: ColumnDef<any>[] = Object.keys(data[0] || {}).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => info.getValue(),
    }));
    console.log("this is the controller")

    return (
      <div key={label} className="mb-8">
        <h2 className="text-lg font-semibold mb-2 capitalize">{label}</h2>
        <DataGrid
          data={data}
          columns={columns}
          entity={label as "clients" | "workers" | "tasks"}
          errors={validationErrors}
        />
      </div>
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Clients, Workers, and Tasks</h1>
      <FileUploader onDataParsed={handleDataParsed} />

      <div className="mt-6">
        {Object.entries(datasets).map(([key, data]) => renderGrid(key, data))}
      </div>

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
        </div>
      )}
    </main>
  );
}
