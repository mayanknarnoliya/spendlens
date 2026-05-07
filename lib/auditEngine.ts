// SpendLens Audit Engine
// All pricing data sourced from official vendor pages — see PRICING_DATA.md

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface Recommendation {
  action: "downgrade" | "switch" | "buy_credits" | "optimal" | "upgrade";
  targetTool?: string;
  targetPlan?: string;
  reason: string;
  monthlySavings: number;
}

export interface ToolAuditResult {
  toolId: string;
  plan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendation: Recommendation;
  benchmarkMonthlySpend: number; // what they should be paying
}

export interface AuditResult {
  tools: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  totalOptimalSpend: number;
  savingsCategory: "high" | "medium" | "low" | "optimal";
  useCase: UseCase;
  teamSize: number;
}

// ─── Pricing Data (official, verified) ───────────────────────────────────────
// All prices in USD/user/month unless noted. See PRICING_DATA.md for sources.

export const PRICING: Record<string, Record<string, number>> = {
  cursor: {
    hobby: 0,
    pro: 20,
    business: 40,
    enterprise: 40, // custom, we use floor
  },
  github_copilot: {
    individual: 10,
    business: 19,
    enterprise: 39,
  },
  claude: {
    free: 0,
    pro: 20,
    max: 100,
    team: 30,
    enterprise: 60, // estimated floor
    api_direct: 0, // usage-based, handled separately
  },
  chatgpt: {
    plus: 20,
    team: 30,
    enterprise: 60, // estimated floor
    api_direct: 0,
  },
  anthropic_api: {
    api_direct: 0, // usage-based
  },
  openai_api: {
    api_direct: 0,
  },
  gemini: {
    pro: 20, // Google One AI Premium
    ultra: 20,
    api: 0,
  },
  windsurf: {
    free: 0,
    pro: 15,
    team: 35,
    enterprise: 35,
  },
};

// Capability tiers for cross-tool comparison
const CAPABILITY_TIER: Record<string, Record<string, number>> = {
  cursor: { hobby: 1, pro: 3, business: 4, enterprise: 5 },
  github_copilot: { individual: 2, business: 3, enterprise: 4 },
  windsurf: { free: 1, pro: 3, team: 4, enterprise: 5 },
  claude: { free: 1, pro: 3, max: 4, team: 3, enterprise: 5, api_direct: 4 },
  chatgpt: { plus: 3, team: 3, enterprise: 5, api_direct: 4 },
  gemini: { pro: 3, ultra: 4, api: 3 },
};

// Best alternative for each tool by use case
const ALTERNATIVES: Record<string, Record<UseCase, { tool: string; plan: string; reason: string }>> = {
  cursor: {
    coding: { tool: "windsurf", plan: "pro", reason: "Windsurf Pro offers comparable AI coding at $15/seat vs Cursor Pro's $20" },
    writing: { tool: "claude", plan: "pro", reason: "Claude Pro is purpose-built for writing tasks at same price point" },
    data: { tool: "github_copilot", plan: "individual", reason: "GitHub Copilot Individual at $10/seat covers data analysis at half the cost" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro excels at research synthesis for $20/seat" },
    mixed: { tool: "windsurf", plan: "pro", reason: "Windsurf Pro handles mixed workloads at lower cost" },
  },
  github_copilot: {
    coding: { tool: "windsurf", plan: "pro", reason: "Windsurf Pro offers superior code completion at $15 vs Copilot Business $19" },
    writing: { tool: "claude", plan: "pro", reason: "Claude Pro is far better for writing; Copilot is coding-first" },
    data: { tool: "cursor", plan: "pro", reason: "Cursor Pro's data analysis capabilities surpass Copilot at similar cost" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro built for research; Copilot not suited to this use case" },
    mixed: { tool: "cursor", plan: "pro", reason: "Cursor handles mixed workloads better than Copilot for similar price" },
  },
  claude: {
    coding: { tool: "cursor", plan: "pro", reason: "Cursor Pro is purpose-built for coding; Claude is generalist" },
    writing: { tool: "claude", plan: "pro", reason: "You're on the right tool — optimize plan instead" },
    data: { tool: "claude", plan: "pro", reason: "Claude Pro handles data tasks well at lower cost than Team/Enterprise" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro is the right tool for research" },
    mixed: { tool: "claude", plan: "pro", reason: "Claude Pro covers mixed workloads well" },
  },
  chatgpt: {
    coding: { tool: "cursor", plan: "pro", reason: "Cursor Pro is built for coding; ChatGPT is generalist at higher price" },
    writing: { tool: "claude", plan: "pro", reason: "Claude Pro typically outperforms ChatGPT for writing at same price" },
    data: { tool: "chatgpt", plan: "plus", reason: "ChatGPT Plus covers data analysis; downgrade from Team if small team" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro rated higher for research accuracy" },
    mixed: { tool: "claude", plan: "pro", reason: "Claude Pro covers mixed workloads at comparable cost" },
  },
  gemini: {
    coding: { tool: "cursor", plan: "pro", reason: "Cursor Pro is specialized for coding; Gemini is generalist" },
    writing: { tool: "claude", plan: "pro", reason: "Claude Pro consistently outperforms Gemini for writing tasks" },
    data: { tool: "claude", plan: "pro", reason: "Claude Pro handles data analysis with better context window" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro built for research synthesis" },
    mixed: { tool: "claude", plan: "pro", reason: "Claude Pro better value for mixed workloads" },
  },
  windsurf: {
    coding: { tool: "windsurf", plan: "pro", reason: "You're on the right tool — optimize plan instead" },
    writing: { tool: "claude", plan: "pro", reason: "Claude Pro purpose-built for writing at $20/seat" },
    data: { tool: "cursor", plan: "pro", reason: "Cursor Pro offers deeper data analysis integrations" },
    research: { tool: "claude", plan: "pro", reason: "Claude Pro better suited for research tasks" },
    mixed: { tool: "cursor", plan: "pro", reason: "Cursor handles mixed workloads well" },
  },
};

// ─── Core Audit Logic ─────────────────────────────────────────────────────────

function getPricePerSeat(toolId: string, plan: string): number {
  return PRICING[toolId]?.[plan] ?? 0;
}

function getOptimalPlan(toolId: string, seats: number, useCase: UseCase): { plan: string; pricePerSeat: number; reason: string } {
  const plans = PRICING[toolId];
  if (!plans) return { plan: "unknown", pricePerSeat: 0, reason: "Unknown tool" };

  // Tool-specific plan logic
  if (toolId === "cursor") {
    if (seats <= 1) return { plan: "pro", pricePerSeat: 20, reason: "Pro is optimal for solo developers" };
    if (seats < 5) return { plan: "pro", pricePerSeat: 20, reason: "Pro plan is right for small teams under 5" };
    return { plan: "business", pricePerSeat: 40, reason: "Business unlocks team features needed at 5+ seats" };
  }

  if (toolId === "github_copilot") {
    if (seats === 1) return { plan: "individual", pricePerSeat: 10, reason: "Individual plan sufficient for solo use" };
    if (seats < 10) return { plan: "business", pricePerSeat: 19, reason: "Business plan for teams under 10" };
    return { plan: "enterprise", pricePerSeat: 39, reason: "Enterprise justified only for 10+ seats with SSO needs" };
  }

  if (toolId === "claude") {
    if (useCase === "coding") return { plan: "pro", pricePerSeat: 20, reason: "Pro is sufficient; Claude isn't the right coding tool regardless of tier" };
    if (seats === 1) return { plan: "pro", pricePerSeat: 20, reason: "Pro covers all individual use cases" };
    if (seats < 5) return { plan: "pro", pricePerSeat: 20, reason: "Pro plan per-seat is cheaper than Team for under 5 seats" };
    return { plan: "team", pricePerSeat: 30, reason: "Team plan unlocks collaboration features for 5+ seats" };
  }

  if (toolId === "chatgpt") {
    if (seats === 1) return { plan: "plus", pricePerSeat: 20, reason: "Plus covers all individual ChatGPT use cases" };
    if (seats < 5) return { plan: "plus", pricePerSeat: 20, reason: "Multiple Plus accounts are cheaper than Team for under 5 seats" };
    return { plan: "team", pricePerSeat: 30, reason: "Team plan makes sense at 5+ seats for shared workspace" };
  }

  if (toolId === "windsurf") {
    if (seats === 1) return { plan: "pro", pricePerSeat: 15, reason: "Pro is the right plan for individual use" };
    if (seats < 8) return { plan: "pro", pricePerSeat: 15, reason: "Pro seats cheaper than Team for small groups" };
    return { plan: "team", pricePerSeat: 35, reason: "Team plan unlocks admin controls at 8+ seats" };
  }

  if (toolId === "gemini") {
    return { plan: "pro", pricePerSeat: 20, reason: "Pro/Ultra are same price; Pro is sufficient for most use cases" };
  }

  return { plan: Object.keys(plans)[0], pricePerSeat: Object.values(plans)[0], reason: "Default plan" };
}

function auditSingleTool(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolAuditResult {
  const { toolId, plan, monthlySpend, seats } = entry;
  const pricePerSeat = getPricePerSeat(toolId, plan);
  const optimalPlan = getOptimalPlan(toolId, seats, useCase);

  // Check if overpaying on current plan
  const expectedSpend = pricePerSeat * seats;
  const optimalSpend = optimalPlan.pricePerSeat * seats;

  // Check cross-tool alternative
  const alt = ALTERNATIVES[toolId]?.[useCase];
  const altPricePerSeat = alt ? getPricePerSeat(alt.tool, alt.plan) : Infinity;
  const altSpend = alt ? altPricePerSeat * seats : Infinity;

  let recommendation: Recommendation;

  // Decision tree:
  // 1. If already on optimal plan and no cheaper alternative → optimal
  // 2. If cheaper alternative exists from different vendor → suggest switch
  // 3. If can downgrade within same vendor → downgrade
  // 4. If paying more than benchmark → flag

  const isOnOptimalPlan = plan === optimalPlan.plan;
  const currentSpendVsExpected = monthlySpend - expectedSpend;
  const savingsFromDowngrade = monthlySpend - optimalSpend;
  const savingsFromSwitch = monthlySpend - altSpend;

  // Overpaying vs benchmark (custom pricing inflated)
  if (currentSpendVsExpected > 50 && seats > 0) {
    recommendation = {
      action: "downgrade",
      targetPlan: optimalPlan.plan,
      reason: `You're paying $${(currentSpendVsExpected / seats).toFixed(0)}/seat above standard ${plan} pricing. Verify your contract or negotiate down to standard rates.`,
      monthlySavings: Math.max(0, currentSpendVsExpected),
    };
  } else if (!isOnOptimalPlan && savingsFromDowngrade > 20) {
    recommendation = {
      action: "downgrade",
      targetPlan: optimalPlan.plan,
      reason: optimalPlan.reason,
      monthlySavings: Math.max(0, savingsFromDowngrade),
    };
  } else if (alt && altSpend < optimalSpend - 30 && alt.tool !== toolId) {
    recommendation = {
      action: "switch",
      targetTool: alt.tool,
      targetPlan: alt.plan,
      reason: alt.reason,
      monthlySavings: Math.max(0, monthlySpend - altSpend),
    };
  } else if (monthlySpend > 200 && seats >= 3) {
    recommendation = {
      action: "buy_credits",
      reason: "At your spend level, buying discounted credits through Credex could save 20–40% vs retail pricing.",
      monthlySavings: Math.round(monthlySpend * 0.25),
    };
  } else {
    recommendation = {
      action: "optimal",
      reason: "You're on the right plan for your team size and use case. Spending looks appropriate.",
      monthlySavings: 0,
    };
  }

  return {
    toolId,
    plan,
    currentMonthlySpend: monthlySpend,
    seats,
    recommendation,
    benchmarkMonthlySpend: optimalSpend,
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  const auditedTools = tools.map((t) => auditSingleTool(t, teamSize, useCase));

  const totalCurrentSpend = auditedTools.reduce((s, t) => s + t.currentMonthlySpend, 0);
  const totalMonthlySavings = auditedTools.reduce((s, t) => s + t.recommendation.monthlySavings, 0);
  const totalOptimalSpend = totalCurrentSpend - totalMonthlySavings;
  const totalAnnualSavings = totalMonthlySavings * 12;

  let savingsCategory: AuditResult["savingsCategory"];
  if (totalMonthlySavings >= 500) savingsCategory = "high";
  else if (totalMonthlySavings >= 100) savingsCategory = "medium";
  else if (totalMonthlySavings > 0) savingsCategory = "low";
  else savingsCategory = "optimal";

  return {
    tools: auditedTools,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    totalOptimalSpend,
    savingsCategory,
    useCase,
    teamSize,
  };
}

export const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export const PLAN_LABELS: Record<string, Record<string, string>> = {
  cursor: { hobby: "Hobby (Free)", pro: "Pro", business: "Business", enterprise: "Enterprise" },
  github_copilot: { individual: "Individual", business: "Business", enterprise: "Enterprise" },
  claude: { free: "Free", pro: "Pro", max: "Max", team: "Team", enterprise: "Enterprise", api_direct: "API Direct" },
  chatgpt: { plus: "Plus", team: "Team", enterprise: "Enterprise", api_direct: "API Direct" },
  anthropic_api: { api_direct: "API Direct" },
  openai_api: { api_direct: "API Direct" },
  gemini: { pro: "Pro (Google One AI Premium)", ultra: "Ultra", api: "API" },
  windsurf: { free: "Free", pro: "Pro", team: "Team", enterprise: "Enterprise" },
};
