export type ValidationError = {
    entity: "clients" | "workers" | "tasks";
    rowIndex: number;
    field: string;
    message: string;
    type: "error" | "warning";
  };
  