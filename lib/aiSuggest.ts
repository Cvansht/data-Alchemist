import { Rule } from "./rulesTypes";

export function suggestRulesFromClients(clients: any[]): Rule[] {
  const taskCount: Record<string, number> = {};
  clients.forEach(c => {
    (c.RequestedTaskIDs?.split(",") || []).forEach((t: string) => {
      t = t.trim();
      if (t) taskCount[t] = (taskCount[t] || 0) + 1;
    });
  });

  const topTasks = Object.entries(taskCount)
    .filter(([_, count]) => count > 2)
    .map(([t]) => t);

  if (topTasks.length >= 2) {
    return [{ type: "coRun", config: { tasks: topTasks.slice(0, 3) } }];
  }

  return [];
}
