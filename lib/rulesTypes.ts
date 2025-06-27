export type RuleType = "coRun" | "loadLimit" | "slotRestriction";

export type Rule = {
  type: RuleType;
  config: Record<string, any>;
};
