"use client";

import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type FileUploaderProps = {
  onDataParsed: (type: string, data: any[]) => void;
};

export default function FileUploader({ onDataParsed }: FileUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const fileName = file.name.toLowerCase();

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;

      if (fileName.endsWith(".csv")) {
        const parsed = Papa.parse(data as string, {
          header: true,
          skipEmptyLines: true,
        });
        let type = fileName.includes("client")
          ? "clients"
          : fileName.includes("worker")
          ? "workers"
          : fileName.includes("task")
          ? "tasks"
          : "unknown";

        onDataParsed(type, parsed.data);
      } else if (fileName.endsWith(".xlsx")) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        onDataParsed(fileName.split(".")[0], json);
      }

      setLoading(false);
    };

    if (fileName.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (fileName.endsWith(".xlsx")) {
      reader.readAsBinaryString(file);
    } else {
      alert("Only .csv and .xlsx are supported.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
      {loading && <p>Parsing file...</p>}
    </div>
  );
}
