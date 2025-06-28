"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
//fallback function 
const fallbackHeaderMap: Record<string, Record<string, string>> = {
  clients: {
    client_id: "ClientID",
    clientid: "ClientID",
    priority: "PriorityLevel",
    prioritylevel: "PriorityLevel",
    requestedtasks: "RequestedTaskIDs",
    taskrequests: "RequestedTaskIDs",
    meta: "AttributesJSON",
    attributes: "AttributesJSON",
    attributesjson: "AttributesJSON",
  },
  workers: {
    workerid: "WorkerID",
    name: "WorkerName",
    skills: "Skills",
    slots: "AvailableSlots",
    maxload: "MaxLoadPerPhase",
    group: "WorkerGroup",
    qualification: "QualificationLevel",
  },
  tasks: {
    taskid: "TaskID",
    name: "TaskName",
    category: "Category",
    duration: "Duration",
    requiredskills: "RequiredSkills",
    preferredphases: "PreferredPhases",
    maxconcurrent: "MaxConcurrent",
  },
};







type FileUploaderProps = {
  onDataParsed: (type: string, data: any[]) => void;
};

export default function FileUploader({ onDataParsed }: FileUploaderProps) {
  const [loading, setLoading] = useState(false);
  async function normalizeHeaders(originalHeaders: string[], entity: string): Promise<string[]> {
    try {
      const res = await fetch("/api/map-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers: originalHeaders, entity }),
      });
      const data = await res.json();
  
      const mapped = data.mappedHeaders || [];
      if (!Array.isArray(mapped) || mapped.length !== originalHeaders.length) {
        throw new Error("AI mapping invalid");
      }
  
      return mapped;
    } catch (err) {
      console.warn("AI mapping failed — using fallback mapping.");
  
      const fallbackMap = fallbackHeaderMap[entity.toLowerCase()] || {};
  
      return originalHeaders.map((raw) => {
        const normalized = raw.toLowerCase().replace(/\s|_/g, "");
        return fallbackMap[normalized] || raw;
      });
    }
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    let fileName = file.name.toLowerCase();
    let type = "";
    
    if (fileName.includes("client")) type = "clients";
    else if (fileName.includes("worker")) type = "workers";
    else if (fileName.includes("task")) type = "tasks";
    else type = "unknown"; // optional fallback
    if (type === "unknown") {
      alert("Unknown entity type. Make sure file name includes client, worker, or task.");
      setLoading(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = event.target?.result;

      if (!data) return;

      try {
        if (fileName.endsWith(".csv")) {
          const parsed = Papa.parse(data as string, {
            header: true,
            skipEmptyLines: true,
          });

          const rawHeaders = Object.keys(parsed.data[0] || {});
          const normalizedHeaders = await normalizeHeaders(rawHeaders, type);

          const remapped = parsed.data.map((row: any) =>
            Object.fromEntries(
              normalizedHeaders.map((header, i) => [header, row[rawHeaders[i]]])
            )
          );

          onDataParsed(type, remapped);
        } else if (fileName.endsWith(".xlsx")) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet);

          const rawHeaders = Object.keys(json[0] || {});
          const normalizedHeaders = await normalizeHeaders(rawHeaders, type);

          const remapped = json.map((row: any) =>
            Object.fromEntries(
              normalizedHeaders.map((header, i) => [header, row[rawHeaders[i]]])
            )
          );

          onDataParsed(type, remapped);
        } else {
          alert("Only .csv and .xlsx formats are supported.");
        }
      } catch (err) {
        console.error("File parsing error:", err);
        alert("Failed to parse or normalize headers.");
      }

      setLoading(false);
    };

    if (fileName.endsWith(".csv")) {
      reader.readAsText(file);
    } else if (fileName.endsWith(".xlsx")) {
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file type.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
      {loading && <p className="text-sm text-gray-600">Parsing & mapping headers...</p>}
    </div>
  );
}
