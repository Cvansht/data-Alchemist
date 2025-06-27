import { Rule } from "./rulesTypes";

export function validateRule(rule: Rule, datasets: Record<string, any[]>): string | null {
  if (rule.type === "coRun") {
    const { tasks } = rule.config;
    const taskIds: string[] = datasets.tasks?.map((task) => task.TaskID) || [];

    // Check if all TaskIDs exist
    const missing = tasks.filter((id: string) => !taskIds.includes(id));
    if (missing.length > 0) {
      return `Invalid TaskIDs: ${missing.join(", ")} not found in uploaded tasks.`;
    }

    // Check for duplicates
    const duplicates = tasks.filter((id: string, index: number, arr: string[]) => arr.indexOf(id) !== index);
    if (duplicates.length > 0) {
      return `Duplicate TaskIDs found: ${[...new Set(duplicates)].join(", ")}`;
    }
  }

  // Add validation for other rule types in the future...

  return null; // no error
}
