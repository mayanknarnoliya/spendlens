# SpendLens — Free AI Spend Audit for Startups

SpendLens is a free web tool that audits your team's AI tool stack, identifies overspending, and shows exactly how much you can save — in under 2 minutes, no account required. It's a lead-generation asset for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

**Live demo:** https://spendlens.vercel.app

---

## Screenshots

> Watch the [30-second screen recording](https://loom.com/your-link) for a full walkthrough.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Anthropic API key
- Resend API key (for transactional email)

### Local development

```bash
git clone https://github.com/yourusername/spendlens
cd spendlens
npm install
cp .env.example .env.local
# Fill in your env vars (see .env.example)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run tests

```bash
npm test
```

### Deploy to Vercel

```bash
vercel --prod
```

### Supabase setup

```sql
create table leads (
  id uuid default gen_random_uuid() primary key,
  audit_id text not null,
  email text not null,
  company_name text,
  role text,
  team_size int,
  monthly_spend numeric,
  monthly_savings numeric,
  annual_savings numeric,
  audit_data jsonb,
  created_at timestamptz default now()
);
create index leads_email_idx on leads(email);
create index leads_audit_id_idx on leads(audit_id);
```

---

## Decisions

1. **Hardcoded audit rules, not AI** — Audit math uses deterministic rules for accuracy and auditability. AI is used only for the personalized prose summary. A finance person can verify every recommendation directly from the code.

2. **Next.js App Router** — Enables per-route metadata (critical for OG tags on shareable audit URLs) and edge runtime for the OG image endpoint. Tradeoff: steeper learning curve vs Pages Router.

3. **Supabase over raw Postgres** — Hosted DB with free tier, no infrastructure maintenance. Tradeoff: vendor lock-in.

4. **localStorage for form state** — Persists form across page reloads without polluting URLs. Tradeoff: doesn't persist across devices.

5. **In-memory rate limiting** — Simple to deploy, sufficient for single-instance deploys. Tradeoff: doesn't work correctly across multiple server instances — would need Redis (Upstash) in production.

---

**Powered by:** [Credex](https://credex.rocks)
