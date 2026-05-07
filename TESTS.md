# TESTS.md

All automated tests for SpendLens. Tests cover the audit engine specifically, as required.

## Running the tests

```bash
npm test
# or for watch mode:
npm run test:watch
```

## Test file

`__tests__/auditEngine.test.ts`

## Test coverage

| # | Test name | What it covers |
|---|-----------|----------------|
| 1 | solo developer on Cursor Pro is optimal for coding | Verifies that a single-seat Cursor Pro subscription at standard pricing returns `action: "optimal"` and zero savings — the baseline "correctly sized" case |
| 2 | small team on Enterprise Copilot should downgrade to Business | Verifies that a 2-person team on GitHub Copilot Enterprise gets a `downgrade` recommendation with positive savings — Enterprise is only justified at 10+ seats |
| 3 | high monthly spend triggers high savings category | With 3 tools at enterprise pricing for 10 seats (~$1,390/mo), verifies `savingsCategory === "high"` and monthly savings > $500 |
| 4 | annual savings equals monthly savings times 12 | Math invariant: `totalAnnualSavings` must always equal `totalMonthlySavings * 12` exactly |
| 5 | Claude on writing use case should not recommend switch to coding tool | For a writing use case, Claude Pro should not recommend switching to Cursor (a coding-first tool). Validates use-case-aware recommendations |
| 6 | paying above benchmark price is flagged as overpayment | A user paying $500 for 5 Cursor Pro seats (vs $100 benchmark) should get a positive savings recommendation — catches inflated enterprise pricing |
| 7 | empty tool list returns zero savings | Edge case: no tools entered → total spend = 0, total savings = 0, no errors thrown |
| 8 | savings category is correct for medium savings | Validates savings category threshold logic — a result between $100–$499/mo savings is `"medium"` or `"low"` depending on exact amount |
| 9 | total spend is sum of all tool spends | Data integrity: `totalCurrentSpend` equals the sum of all tool `monthlySpend` inputs |
| 10 | optimal spend never exceeds current spend | Invariant: the optimized spend must always be ≤ current spend. Savings can't be negative. |

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`. See the green check on the latest commit.
