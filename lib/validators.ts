import { ValidationError } from "@/app/types/validationTypes";

export const validateClients = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  data.forEach((row, index) => {
    const clientId = row.ClientID?.trim();

    if (!clientId) {
      errors.push({
        entity: "clients",
        rowIndex: index,
        field: "ClientID",
        message: "ClientID is required",
        type: "error",
      });
    } else if (seenIds.has(clientId)) {
      errors.push({
        entity: "clients",
        rowIndex: index,
        field: "ClientID",
        message: "Duplicate ClientID",
        type: "error",
      });
    }
    seenIds.add(clientId);

    const priority = Number(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.push({
        entity: "clients",
        rowIndex: index,
        field: "PriorityLevel",
        message: "PriorityLevel must be between 1 and 5",
        type: "error",
      });
    }

    try {
      JSON.parse(row.AttributesJSON);
    } catch {
      errors.push({
        entity: "clients",
        rowIndex: index,
        field: "AttributesJSON",
        message: "Malformed JSON in AttributesJSON",
        type: "error",
      });
    }
  });

  return errors;
};
