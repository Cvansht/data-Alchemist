"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { ValidationError } from "../types/validationTypes";
import { Button } from "@/components/ui/button";

// Add types
type PrioritizationWeights = {
  priorityLevel: number;
  taskFulfillment: number;
  fairness: number;
};

type DataGridProps = {
  data: any[];
  columns: ColumnDef<any>[];
  entity: "clients" | "workers" | "tasks";
  errors: ValidationError[];
  onDataUpdate?: (updatedData: any[]) => void;
  setValidationErrors?: (errors: ValidationError[]) => void;
  prioritization?: PrioritizationWeights;
  setPrioritization?: (weights: PrioritizationWeights) => void;
  searchQuery?: string;
  parsedFilters?: { field: string; op: string; value: any }[];
};

export default function DataGrid<T>({
  data,
  columns,
  errors = [],
  entity,
  onDataUpdate,
  setValidationErrors,
  prioritization,
  setPrioritization,
  searchQuery = "",
  parsedFilters = [],
}: //@ts-ignore
DataGridProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});
  const [presetValue, setPresetValue] = useState("");
  const [filterPriority, setFilterPriority] = useState<number | null>(null);

  const conditions = React.useMemo(() => {
    return (searchQuery || "")
      .split(/\s+AND\s+/i)
      .map((clause: any) => {
        const m = clause.match(/(\w+)\s*(>=|<=|=|>|<)\s*(.+)/);
        if (!m) return null;
        const [, field, op, raw] = m;
        const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
        return { field, op, value } as {
          field: string;
          op: string;
          value: string | number;
        };
      })
      .filter(Boolean) as { field: string; op: string; value: any }[];
  }, [searchQuery]);

  const filteredData = React.useMemo(() => {
    // 1) If AI-parsed filters exist, use them
    if (parsedFilters.length) {
      return tableData.filter((row: any) =>
        //@ts-ignore
        parsedFilters.every(({ field, op, value }) => {
          const cv = row[field];
          console.log("parsedFilters:", parsedFilters);
          console.log("conditions:", conditions);
          if (cv == null) return false;
          const num = Number(cv);
          switch (op) {
            case ">":
              return num > value;
            case "<":
              return num < value;
            case ">=":
              return num >= value;
            case "<=":
              return num <= value;
            case "=":
              return cv.toString() === value.toString();
            default:
              return false;
          }
        })
      );
    }

    // 2) Otherwise if simple conditions from searchQuery exist, use those
    if (conditions.length) {
      return tableData.filter((row: any) =>
        conditions.every(({ field, op, value }) => {
          const cv = row[field];
          if (cv == null) return false;
          const num = Number(cv);
          switch (op) {
            case ">":
              return num > value;
            case "<":
              return num < value;
            case ">=":
              return num >= value;
            case "<=":
              return num <= value;
            case "=":
              return cv.toString() === value.toString();
            default:
              return false;
          }
        })
      );
    }

    // 3) No filters at all → return the full dataset
    return tableData;
  }, [tableData, parsedFilters, conditions]);

  const handleSuggestFix = async (rowData: any, rowIndex: number) => {
    const rowErrors = errors.filter(
      (e: any) => e.rowIndex === rowIndex && e.entity === entity
    );

    const res = await fetch("/api/suggest-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: rowData, entity, errors: rowErrors }),
    });

    const { fixed } = await res.json();

    const updated = [...tableData];
    updated[rowIndex] = fixed;
    setTableData(updated);

    if (onDataUpdate) onDataUpdate(updated);

    if (entity === "clients" && setValidationErrors) {
      const { validateClients } = require("@/lib/validators");
      const newErrors = validateClients(updated);
      setValidationErrors((prev: ValidationError[]) => [
        ...prev.filter((e) => e.entity !== "clients"),
        ...newErrors,
      ]);
    }

    alert("Fix applied!");
  };

  const table = useReactTable({
    data: filteredData,
    columns: columns.map((col: any, colIndex: number) => {
      // Choose a unique id: prefer the accessorKey, otherwise fall back to index
      const safeId =
        typeof col.accessorKey === "string" && col.accessorKey.trim() !== ""
          ? col.accessorKey
          : `col_${colIndex}`;

      return {
        id: safeId,
        accessorKey: safeId,
        header: col.header,
        cell: (info: any) => {
          const rowIndex = info.row.index;
          const value = info.getValue();
          const field = info.column.id;

          if (editingRow === rowIndex) {
            if (field === "PriorityLevel") {
              return (
                <>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={editedRow.PriorityLevel}
                    onChange={(e) =>
                      setEditedRow({
                        ...editedRow,
                        PriorityLevel: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-center text-slate-400">
                    {editedRow.PriorityLevel}
                  </div>
                </>
              );
            }
            return (
              <input
                className="border border-slate-600 bg-slate-900 text-white px-1 py-1 rounded w-full"
                value={editedRow[field] ?? ""}
                onChange={(e) =>
                  setEditedRow({ ...editedRow, [field]: e.target.value })
                }
              />
            );
          }

          return <span>{value}</span>;
        },
      };
    }),
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSave = () => {
    if (editingRow === null) return;
    const updated = [...tableData];
    updated[editingRow] = editedRow;
    setTableData(updated);
    setEditingRow(null);
    setEditedRow({});
    setPresetValue("");
    onDataUpdate?.(updated);

    if (entity === "clients" && setValidationErrors) {
      const { validateClients } = require("@/lib/validators");
      const errors = validateClients(updated);
      setValidationErrors((prev: ValidationError[]) => [
        ...prev.filter((e) => e.entity !== "clients"),
        ...errors,
      ]);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedRow({});
    setPresetValue("");
  };

  const handlePreset = (val: string) => {
    let level = 1;
    if (val === "VIP") level = 5;
    else if (val === "Regular") level = 3;
    else if (val === "Low") level = 1;
    setEditedRow({ ...editedRow, PriorityLevel: level });
    setPresetValue(val);
  };

  return (
    <div className="overflow-x-auto border border-slate-700 rounded-md p-4 mt-6 bg-slate-900 text-white">
      {entity === "clients" && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm text-slate-300">Min Priority:</label>
            <input
              type="number"
              min={1}
              max={10}
              value={filterPriority ?? ""}
              onChange={(e) =>
                setFilterPriority(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="border border-slate-600 bg-slate-800 text-white px-2 py-1 rounded text-sm w-24"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilterPriority(null)}
            >
              Reset
            </Button>
          </div>

          {setPrioritization && (
            <div className="mb-4 border border-slate-700 p-4 rounded bg-slate-800">
              <h3 className="text-sm font-semibold mb-2 text-slate-300">
                Prioritization Weights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {Object.entries(prioritization || {}).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-slate-400">{key}</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      //@ts-ignore
                      value={val}
                      onChange={(e) =>
                        setPrioritization({
                          ...(prioritization || {}),
                          [key]: Number(e.target.value),
                        })
                      }
                    />
                    <span className="text-center text-xs text-slate-400">
                      {/* {val} */}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className="border border-slate-700 px-3 py-2 bg-slate-800 text-slate-300"
                  key={header.id}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
              <th className="border border-slate-700 px-3 py-2 bg-slate-800 text-slate-300">
                Actions
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-800">
              {row.getVisibleCells().map((cell) => {
                const field = cell.column.id;
                const hasError = errors.some(
                  (e: any) =>
                    e.entity === entity &&
                    e.rowIndex === row.index &&
                    e.field === field
                );

                return (
                  <td
                    key={cell.id}
                    className={`border border-slate-700 px-3 py-2 ${
                      hasError ? "bg-red-900 text-red-400 font-semibold" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
              <td className="border border-slate-700 px-3 py-2 space-x-2">
                {editingRow === row.index ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex gap-2 items-center">
                      <select
                        value={presetValue}
                        onChange={(e) => handlePreset(e.target.value)}
                        className="text-xs border border-slate-600 bg-slate-900 text-white rounded p-1"
                      >
                        <option value="">-- Preset --</option>
                        <option value="VIP">VIP (5)</option>
                        <option value="Regular">Regular (3)</option>
                        <option value="Low">Low (1)</option>
                      </select>
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingRow(row.index);
                      setEditedRow(row.original);
                      setPresetValue("");
                    }}
                  >
                    Edit
                  </Button>
                )}
                {errors.some(
                  (e: any) => e.rowIndex === row.index && e.entity === entity
                ) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestFix(row.original, row.index)}
                  >
                    Suggest Fix
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
