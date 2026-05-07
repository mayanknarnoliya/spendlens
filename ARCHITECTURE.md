# ARCHITECTURE.md

## System Diagram

```mermaid
graph TD
    A[User: Browser] -->|Fill form| B[SpendLensApp Component]
    B -->|localStorage| C[Form State Persistence]
    B -->|POST /api/audit| D[Audit API Route]
    D -->|runAudit| E[auditEngine.ts]
    D -->|generateAuditSummary| F[Anthropic API / Claude Sonnet]
    F -->|Fallback| G[Template Summary]
    D -->|Return auditId + result + summary| B
    B -->|Show results page| H[Results UI]
    H -->|POST /api/leads| I[Lead Capture API]
    I -->|Insert| J[Supabase / Postgres]
    I -->|Send email| K[Resend API]
    H -->|Copy link| L[Shareable URL /audit/id]
    L -->|OG image| M[/api/og Edge Route]
```

## Data Flow: Input → Audit Result

1. **User fills form** — tool selections, plan, monthly spend, seats, team size, use case. Form state is serialized to `localStorage` on every change.

2. **POST /api/audit** — receives `AuditInput` JSON. Rate-limited by IP (10 req/min in-memory map). Validates that tools array is non-empty.

3. **auditEngine.ts** — pure TypeScript function, no external calls. For each tool:
   - Looks up official benchmark pricing
   - Determines optimal plan for their seat count and use case
   - Computes savings from plan downgrade vs cross-tool switch vs credits
   - Returns recommendation with action type + reason + monthly savings

4. **Anthropic API call** — sends audit summary prompt to `claude-sonnet-4-20250514`. Falls back to deterministic template if API fails or returns 429.

5. **Response** — `{ auditId, result: AuditResult, summary: string }` returned to client. `auditId` is a `nanoid(10)` — used for shareable URL.

6. **Lead capture** — user submits email after seeing results (value-first). API inserts to Supabase and sends transactional email via Resend. Honeypot field protects against bots.

7. **Shareable URL** — `/audit/[id]?savings=X&annual=Y&tools=Z` — query params carry public data (no PII). OG image generated via `/api/og` edge route.

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | Per-route metadata for OG tags, edge runtime, RSC |
| Language | TypeScript | Type safety on audit logic prevents pricing bugs |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Database | Supabase (Postgres) | Hosted, free tier, instant REST + real-time |
| AI | Anthropic claude-sonnet-4-20250514 | Best summary quality; graceful fallback |
| Email | Resend | Simple API, reliable deliverability, free tier |
| Deploy | Vercel | Zero-config Next.js deploy, edge runtime support |
| Tests | Jest + ts-jest | Native TypeScript support, fast |

## What would change at 10k audits/day?

1. **Rate limiting** — Replace in-memory map with Redis (Upstash free tier) for distributed rate limiting across instances.

2. **Audit caching** — Cache identical input hashes (same tool/plan/spend combos) in Redis for 1 hour. At scale, many users have similar stacks.

3. **AI summary queue** — Move Anthropic API calls to a background queue (e.g., Inngest or Vercel Queue). Return audit instantly, push summary when ready via webhook/SSE.

4. **Database** — Supabase free tier handles ~500 inserts/day. At 10k audits, upgrade to Pro ($25/mo) or add connection pooling via Supabase's built-in pgBouncer.

5. **OG images** — Cache OG images at the CDN layer (Vercel Edge Cache) by audit ID to avoid regenerating on every social preview crawl.

6. **Analytics** — Add PostHog for funnel analysis: form_start → audit_complete → email_captured → consultation_booked.
