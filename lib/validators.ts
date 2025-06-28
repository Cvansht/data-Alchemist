// File: lib/validators.ts

import { ValidationError } from "@/app/types/validationTypes";
import { Rule } from "@/lib/rulesTypes";

function pushError(
  errors: ValidationError[],
  entity: string,
  rowIndex: number,
  field: string,
  message: string
) {
  //@ts-ignore
  errors.push({ entity , rowIndex, field, message, type: "error" });
}

const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export function validateStructure(data: any[], type: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.length) return errors;

  const requiredFields: Record<string, string[]> = {
    clients: ["ClientID", "PriorityLevel", "RequestedTaskIDs", "GroupTag", "AttributesJSON"],
    workers: ["WorkerID", "AvailableSlots", "Skills", "MaxLoadPerPhase"],
    tasks: ["TaskID", "Duration", "PreferredPhases", "RequiredSkills", "MaxConcurrent"],
  };

  const fields = requiredFields[type] || [];
  fields.forEach((field) => {
    if (!(field in data[0])) {
      pushError(errors, type, -1, field, `${field} column is missing`);
    }
  });
  return errors;
}

export function validateClients(data: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Set<string>();

  data.forEach((row, index) => {
    const clientId = row.ClientID?.trim();
    if (!clientId) pushError(errors, "clients", index, "ClientID", "ClientID is required");
    else if (seenIds.has(clientId)) pushError(errors, "clients", index, "ClientID", "Duplicate ClientID");
    seenIds.add(clientId);

    const priority = Number(row.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5)
      pushError(errors, "clients", index, "PriorityLevel", "PriorityLevel must be between 1 and 5");

    const requested = row.RequestedTaskIDs?.split(',').map((t: string) => t.trim());
    if (!requested || requested.length === 0 || requested.some((id: string) => !id))
      pushError(errors, "clients", index, "RequestedTaskIDs", "Missing or invalid RequestedTaskIDs");

    if (!isValidJSON(row.AttributesJSON))
      pushError(errors, "clients", index, "AttributesJSON", "Malformed JSON in AttributesJSON");
  });

  return errors;
}

export function validateWorkers(data: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Set();

  data.forEach((row, index) => {
    const id = row.WorkerID?.trim();
    if (!id) pushError(errors, "workers", index, "WorkerID", "WorkerID is required");
    else if (seen.has(id)) pushError(errors, "workers", index, "WorkerID", "Duplicate WorkerID");
    seen.add(id);

    try {
      const parsed = JSON.parse(row.AvailableSlots);
      if (!Array.isArray(parsed) || parsed.some((s: any) => isNaN(Number(s)))) {
        throw new Error();
      }
    } catch {
      pushError(errors, "workers", index, "AvailableSlots", "Malformed list in AvailableSlots");
    }

    const maxLoad = Number(row.MaxLoadPerPhase);
    if (isNaN(maxLoad) || maxLoad < 1)
      pushError(errors, "workers", index, "MaxLoadPerPhase", "MaxLoadPerPhase must be ≥ 1");
  });

  return errors;
}

export function validateTasks(data: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Set();

  data.forEach((row, index) => {
    const id = row.TaskID?.trim();
    if (!id) pushError(errors, "tasks", index, "TaskID", "TaskID is required");
    else if (seen.has(id)) pushError(errors, "tasks", index, "TaskID", "Duplicate TaskID");
    seen.add(id);

    const duration = Number(row.Duration);
    if (isNaN(duration) || duration < 1)
      pushError(errors, "tasks", index, "Duration", "Duration must be ≥ 1");

    const max = Number(row.MaxConcurrent);
    if (isNaN(max) || max < 1)
      pushError(errors, "tasks", index, "MaxConcurrent", "MaxConcurrent must be ≥ 1");

    const preferred = row.PreferredPhases;
    if (preferred && typeof preferred === 'string') {
      const valid = preferred.match(/^\[.*\]$|^(\d+(-\d+)?)(,\d+(-\d+)?)*$/);
      if (!valid) pushError(errors, "tasks", index, "PreferredPhases", "Invalid format in PreferredPhases");
    }
  });

  return errors;
}

export function validateCrossReferences(
  clients: any[],
  tasks: any[],
  workers: any[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const taskIds = new Set(tasks.map((t) => t.TaskID));
  const workerSkills = new Set(
    workers.flatMap((w) => JSON.parse(w.Skills || "[]"))
  );

  clients.forEach((row, index) => {
    const req = row.RequestedTaskIDs;
    const ids = typeof req === "string" ? req.split(/,\s*/) : req;
    ids.forEach((id: string) => {
      if (!taskIds.has(id)) {
        pushError(errors, "clients", index, "RequestedTaskIDs", `Unknown task ID: ${id}`);
      }
    });
  });

  tasks.forEach((row, index) => {
    const requiredSkills = JSON.parse(row.RequiredSkills || "[]");
    requiredSkills.forEach((s: string) => {
      if (!workerSkills.has(s)) {
        pushError(errors, "tasks", index, "RequiredSkills", `No worker has skill '${s}'`);
      }
    });
  });

  return errors;
}

export function validateRules(rules: Rule[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const graph: Record<string, string[]> = {};

  rules.forEach((rule) => {
    if (rule.type === "coRun") {
      const tasks = rule.config.tasks;
      tasks.forEach((t1: string) => {
        tasks.forEach((t2: string) => {
          if (t1 !== t2) {
            graph[t1] = graph[t1] || [];
            graph[t1].push(t2);
          }
        });
      });
    }
  });

  const visited = new Set();
  const stack = new Set();

  const dfs = (node: string): boolean => {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);

    for (const neighbor of graph[node] || []) {
      if (dfs(neighbor)) return true;
    }

    stack.delete(node);
    return false;
  };

  for (const node in graph) {
    if (dfs(node)) {
      pushError(errors, "rules", -1, "coRun", `Circular co-run group involving ${node}`);
      break;
    }
  }

  return errors;
}
