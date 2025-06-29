"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

// fallback header map (unchanged)
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

  const parseAndHandleFile = async (file: File) => {
    let fileName = file.name.toLowerCase();
    let type = "";

    if (fileName.includes("client")) type = "clients";
    else if (fileName.includes("worker")) type = "workers";
    else if (fileName.includes("task")) type = "tasks";
    else type = "unknown";

    if (type === "unknown") {
      alert("Unknown entity type. Make sure file name includes client, worker, or task.");
      return;
    }

    setLoading(true);
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
            Object.fromEntries(normalizedHeaders.map((header, i) => [header, row[rawHeaders[i]]]))
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
            Object.fromEntries(normalizedHeaders.map((header, i) => [header, row[rawHeaders[i]]]))
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(parseAndHandleFile);
    },
  });

  return (
    <div className="border border-slate-700 rounded-lg p-6 bg-gradient-to-br from-[#111827] to-[#1f2937] shadow-xl">
      <h2 className="text-white text-lg font-semibold flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-blue-400" /> Data Upload
      </h2>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-all cursor-pointer text-slate-400",
          isDragActive ? "bg-slate-800 border-blue-400" : "bg-slate-900 border-slate-600"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
        <p className="text-sm text-center">
          Drag and drop your <span className="text-blue-400">CSV/XLSX</span> files here
          <br />
          <span className="text-xs text-slate-500">or click to browse files</span>
        </p>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm">
          Choose Files
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-blue-300 mt-4 animate-pulse">
          Parsing & mapping headers...
        </p>
      )}
    </div>
  );
}
