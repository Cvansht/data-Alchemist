"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { ValidationError } from "../types/validationTypes";
import { Button } from "@/components/ui/button";

type DataGridProps = {
  data: any[];
  columns: ColumnDef<any>[];
  entity: "clients" | "workers" | "tasks";
  errors: ValidationError[];
  onDataUpdate?: (updatedData: any[]) => void;
  setValidationErrors?: (errors: ValidationError[]) => void;
};

export default function DataGrid<T>({
  data,
  columns,
  errors = [],
  entity,
  onDataUpdate,
  setValidationErrors,
}:
//@ts-ignore
 DataGridProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});
  const [presetValue, setPresetValue] = useState("");
  const [filterPriority, setFilterPriority] = useState<number | null>(null);

  const filteredData = filterPriority
    ? tableData.filter((row: any) => row.PriorityLevel >= filterPriority)
    : tableData;

  const table = useReactTable({
    data: filteredData,
    columns: columns.map((col : any) => ({
      ...col,
      cell: (info: any) => {
        const rowIndex = info.row.index;
        const value = info.getValue();
        const field = info.column.id;

        if (editingRow === rowIndex) {
          return field === "PriorityLevel" ? (
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
              <div className="text-xs text-center text-gray-600">
                {editedRow.PriorityLevel}
              </div>
            </>
          ) : (
            <input
              className="border px-1 rounded w-full"
              value={editedRow[field] ?? ""}
              onChange={(e) =>
                setEditedRow({ ...editedRow, [field]: e.target.value })
              }
            />
          );
        }

        return <span>{value}</span>;
      },
    })),
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
    <div className="overflow-x-auto border rounded-md p-2 mt-4">
      {entity === "clients" && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm">Min Priority:</label>
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
            className="border px-2 py-1 rounded text-sm w-20"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilterPriority(null)}
          >
            Reset
          </Button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="border px-2 py-1 bg-gray-100" key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              <th className="border px-2 py-1 bg-gray-100">Actions</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const field = cell.column.id;
                const hasError = errors.some(
                  (e:any) =>
                    e.entity === entity &&
                    e.rowIndex === row.index &&
                    e.field === field
                );

                return (
                  <td
                    key={cell.id}
                    className={`border px-2 py-1 ${
                      hasError ? "bg-red-100 text-red-800 font-semibold" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
              <td className="border px-2 py-1 space-x-2">
                {editingRow === row.index ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex gap-2 items-center">
                      <select
                        value={presetValue}
                        onChange={(e) => handlePreset(e.target.value)}
                        className="text-xs border rounded p-1"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
