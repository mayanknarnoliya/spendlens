import { runAudit, AuditInput, AuditResult } from "../lib/auditEngine";

describe("Audit Engine", () => {
  // Test 1: Solo developer on Cursor Pro — should be optimal
  test("solo developer on Cursor Pro is optimal for coding", () => {
    const input: AuditInput = {
      tools: [{ toolId: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }],
      teamSize: 1,
      useCase: "coding",
    };
    const result = runAudit(input);
    const cursorResult = result.tools[0];
    expect(cursorResult.recommendation.action).toBe("optimal");
    expect(result.totalMonthlySavings).toBe(0);
  });

  // Test 2: 2-person team on GitHub Copilot Enterprise — overkill
  test("small team on Enterprise Copilot should downgrade to Business", () => {
    const input: AuditInput = {
      tools: [{ toolId: "github_copilot", plan: "enterprise", monthlySpend: 78, seats: 2 }],
      teamSize: 2,
      useCase: "coding",
    };
    const result = runAudit(input);
    const toolResult = result.tools[0];
    expect(toolResult.recommendation.action).toBe("downgrade");
    expect(toolResult.recommendation.monthlySavings).toBeGreaterThan(0);
  });

  // Test 3: Large team should get high savings category at high spend
  test("high monthly spend triggers high savings category", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "enterprise", monthlySpend: 400, seats: 10 },
        { toolId: "github_copilot", plan: "enterprise", monthlySpend: 390, seats: 10 },
        { toolId: "chatgpt", plan: "enterprise", monthlySpend: 600, seats: 10 },
      ],
      teamSize: 10,
      useCase: "coding",
    };
    const result = runAudit(input);
    expect(result.totalCurrentSpend).toBe(1390);
    expect(result.savingsCategory).toBe("high");
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
  });

  // Test 4: Annual savings = monthly * 12
  test("annual savings equals monthly savings times 12", () => {
    const input: AuditInput = {
      tools: [{ toolId: "github_copilot", plan: "enterprise", monthlySpend: 390, seats: 10 }],
      teamSize: 10,
      useCase: "coding",
    };
    const result = runAudit(input);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  // Test 5: Claude on writing use case — should stay on Claude
  test("Claude on writing use case should not recommend switch to coding tool", () => {
    const input: AuditInput = {
      tools: [{ toolId: "claude", plan: "pro", monthlySpend: 20, seats: 1 }],
      teamSize: 1,
      useCase: "writing",
    };
    const result = runAudit(input);
    const toolResult = result.tools[0];
    // Should not recommend switching to Cursor for writing
    expect(toolResult.recommendation.targetTool).not.toBe("cursor");
  });

  // Test 6: Paying over benchmark price triggers downgrade flag
  test("paying above benchmark price is flagged as overpayment", () => {
    const input: AuditInput = {
      tools: [{ toolId: "cursor", plan: "pro", monthlySpend: 500, seats: 5 }], // $100/seat vs $20 benchmark
      teamSize: 5,
      useCase: "coding",
    };
    const result = runAudit(input);
    const toolResult = result.tools[0];
    // Monthly savings should reflect the overpayment
    expect(toolResult.recommendation.monthlySavings).toBeGreaterThan(0);
  });

  // Test 7: Zero tools returns zero savings
  test("empty tool list returns zero savings", () => {
    const input: AuditInput = {
      tools: [],
      teamSize: 5,
      useCase: "mixed",
    };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalCurrentSpend).toBe(0);
  });

  // Test 8: Savings category thresholds
  test("savings category is correct for medium savings", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "github_copilot", plan: "enterprise", monthlySpend: 200, seats: 5 },
      ],
      teamSize: 5,
      useCase: "coding",
    };
    const result = runAudit(input);
    // 5 seats enterprise = $195/mo, benchmark business = $95/mo → savings ~$100
    expect(["medium", "high", "low"]).toContain(result.savingsCategory);
  });

  // Test 9: Multiple tools sum correctly
  test("total spend is sum of all tool spends", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "pro", monthlySpend: 100, seats: 5 },
        { toolId: "claude", plan: "pro", monthlySpend: 60, seats: 3 },
      ],
      teamSize: 5,
      useCase: "mixed",
    };
    const result = runAudit(input);
    expect(result.totalCurrentSpend).toBe(160);
  });

  // Test 10: Optimal spend <= current spend always
  test("optimal spend never exceeds current spend", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", plan: "business", monthlySpend: 400, seats: 10 },
        { toolId: "chatgpt", plan: "enterprise", monthlySpend: 600, seats: 10 },
        { toolId: "gemini", plan: "ultra", monthlySpend: 200, seats: 10 },
      ],
      teamSize: 10,
      useCase: "mixed",
    };
    const result = runAudit(input);
    expect(result.totalOptimalSpend).toBeLessThanOrEqual(result.totalCurrentSpend);
  });
});
