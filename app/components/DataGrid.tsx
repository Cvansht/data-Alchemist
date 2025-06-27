"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { ValidationError } from "../types/validationTypes";

type DataGridProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  errors?: ValidationError[];
  entity: 'clients' | 'workers' | 'tasks';
};

export default function DataGrid<T>({
  data,
  columns,
  errors = [],
  entity,
}: DataGridProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto border rounded-md p-2 mt-4">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="border px-2 py-1 bg-gray-100" key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const hasError = errors.some(
                  (e) =>
                    e.entity === entity &&
                    e.rowIndex === row.index &&
                    e.field === cell.column.id
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
