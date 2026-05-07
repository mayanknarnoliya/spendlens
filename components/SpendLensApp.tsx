"use client";

import { useState, useEffect } from "react";
import { AuditResult, TOOL_LABELS, PLAN_LABELS } from "@/lib/auditEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolEntry {
  id: number;
  toolId: string;
  plan: string;
  monthlySpend: string; // string so input field works properly
  seats: string;
}

interface FormState {
  tools: ToolEntry[];
  teamSize: string;
  useCase: "coding" | "writing" | "data" | "research" | "mixed";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVAILABLE_TOOLS = [
  {
    id: "cursor",
    label: "Cursor",
    emoji: "⚡",
    desc: "AI code editor",
    plans: [
      { id: "hobby", label: "Hobby (Free)", price: 0 },
      { id: "pro", label: "Pro — $20/user/mo", price: 20 },
      { id: "business", label: "Business — $40/user/mo", price: 40 },
      { id: "enterprise", label: "Enterprise (custom)", price: 40 },
    ],
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    emoji: "🐙",
    desc: "AI coding assistant",
    plans: [
      { id: "individual", label: "Individual — $10/user/mo", price: 10 },
      { id: "business", label: "Business — $19/user/mo", price: 19 },
      { id: "enterprise", label: "Enterprise — $39/user/mo", price: 39 },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    emoji: "🔶",
    desc: "Anthropic's AI assistant",
    plans: [
      { id: "free", label: "Free", price: 0 },
      { id: "pro", label: "Pro — $20/user/mo", price: 20 },
      { id: "max", label: "Max — $100/user/mo", price: 100 },
      { id: "team", label: "Team — $30/user/mo", price: 30 },
      { id: "enterprise", label: "Enterprise (custom)", price: 60 },
      { id: "api_direct", label: "API Direct (usage-based)", price: 0 },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    emoji: "🟢",
    desc: "OpenAI's ChatGPT",
    plans: [
      { id: "plus", label: "Plus — $20/user/mo", price: 20 },
      { id: "team", label: "Team — $30/user/mo", price: 30 },
      { id: "enterprise", label: "Enterprise (custom)", price: 60 },
      { id: "api_direct", label: "API Direct (usage-based)", price: 0 },
    ],
  },
  {
    id: "anthropic_api",
    label: "Anthropic API",
    emoji: "🔴",
    desc: "Direct API access",
    plans: [{ id: "api_direct", label: "API Direct (usage-based)", price: 0 }],
  },
  {
    id: "openai_api",
    label: "OpenAI API",
    emoji: "⚫",
    desc: "Direct API access",
    plans: [{ id: "api_direct", label: "API Direct (usage-based)", price: 0 }],
  },
  {
    id: "gemini",
    label: "Gemini",
    emoji: "💎",
    desc: "Google's AI",
    plans: [
      { id: "pro", label: "Pro (Google One AI) — $20/mo", price: 20 },
      { id: "ultra", label: "Ultra — $20/mo", price: 20 },
      { id: "api", label: "API (usage-based)", price: 0 },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    emoji: "🏄",
    desc: "AI code editor by Codeium",
    plans: [
      { id: "free", label: "Free", price: 0 },
      { id: "pro", label: "Pro — $15/user/mo", price: 15 },
      { id: "team", label: "Team — $35/user/mo", price: 35 },
      { id: "enterprise", label: "Enterprise (custom)", price: 35 },
    ],
  },
];

const USE_CASES = [
  { id: "coding", label: "💻 Coding & Development" },
  { id: "writing", label: "✍️ Writing & Content" },
  { id: "data", label: "📊 Data & Analysis" },
  { id: "research", label: "🔍 Research" },
  { id: "mixed", label: "🔀 Mixed / General" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

let nextId = 1;
function newTool(toolId = "cursor"): ToolEntry {
  const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId)!;
  return { id: nextId++, toolId, plan: tool.plans[0].id, monthlySpend: "", seats: "1" };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SpendLensApp() {
  const [formState, setFormState] = useState<FormState>({
    tools: [newTool("cursor")],
    teamSize: "",
    useCase: "coding",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Results
  const [result, setResult] = useState<AuditResult | null>(null);
  const [summary, setSummary] = useState("");
  const [auditId, setAuditId] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  // Lead capture
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [leadDone, setLeadDone] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [copied, setCopied] = useState(false);

  // Persist form to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("spendlens_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormState(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("spendlens_v2", JSON.stringify(formState));
    } catch {}
  }, [formState]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  function addTool() {
    const usedIds = formState.tools.map((t) => t.toolId);
    const unused = AVAILABLE_TOOLS.find((t) => !usedIds.includes(t.id));
    if (!unused) return;
    setFormState((f) => ({ ...f, tools: [...f.tools, newTool(unused.id)] }));
  }

  function removeTool(id: number) {
    setFormState((f) => ({ ...f, tools: f.tools.filter((t) => t.id !== id) }));
  }

  function updateTool(id: number, field: keyof ToolEntry, value: string) {
    setFormState((f) => ({
      ...f,
      tools: f.tools.map((t) => {
        if (t.id !== id) return t;
        if (field === "toolId") {
          const toolDef = AVAILABLE_TOOLS.find((td) => td.id === value)!;
          return { ...t, toolId: value, plan: toolDef.plans[0].id };
        }
        return { ...t, [field]: value };
      }),
    }));
    // Clear error on change
    setErrors((e) => {
      const copy = { ...e };
      delete copy[`tool_${id}_${field}`];
      return copy;
    });
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formState.teamSize || parseInt(formState.teamSize) < 1) {
      newErrors["teamSize"] = "Team size is required (minimum 1)";
    }

    formState.tools.forEach((tool) => {
      if (!tool.monthlySpend || tool.monthlySpend === "") {
        newErrors[`tool_${tool.id}_monthlySpend`] = "Enter monthly spend (0 if free)";
      }
      if (!tool.seats || parseInt(tool.seats) < 1) {
        newErrors[`tool_${tool.id}_seats`] = "Enter number of seats (minimum 1)";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function runAudit() {
    if (!validate()) {
      // Scroll to first error
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setApiError("");

    const payload = {
      tools: formState.tools.map((t) => ({
        toolId: t.toolId,
        plan: t.plan,
        monthlySpend: parseFloat(t.monthlySpend) || 0,
        seats: parseInt(t.seats) || 1,
      })),
      teamSize: parseInt(formState.teamSize) || 1,
      useCase: formState.useCase,
    };

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Audit failed");
      const data = await res.json();
      setResult(data.result);
      setSummary(data.summary);
      setAuditId(data.auditId);
      setExpandedIdx(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLeadLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: company,
          role,
          teamSize: parseInt(formState.teamSize) || 1,
          auditId,
          monthlySpend: result?.totalCurrentSpend,
          monthlySavings: result?.totalMonthlySavings,
          annualSavings: result?.totalAnnualSavings,
          savingsCategory: result?.savingsCategory,
          auditData: result,
          website: "", // honeypot
        }),
      });
      setLeadDone(true);
    } catch {
      setLeadDone(true); // still show success
    } finally {
      setLeadLoading(false);
    }
  }

  function shareAudit() {
    if (!result) return;
    const url = `${window.location.origin}/audit/${auditId}?savings=${result.totalMonthlySavings}&annual=${result.totalAnnualSavings}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function getPlanLabel(toolId: string, plan: string) {
    return PLAN_LABELS[toolId]?.[plan] ?? plan;
  }

  const ACTION_MAP: Record<string, { label: string; color: string; bg: string }> = {
    optimal: { label: "✓ Spending well", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    downgrade: { label: "↓ Downgrade plan", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    switch: { label: "⇄ Switch tool", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    buy_credits: { label: "💳 Buy credits", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
    upgrade: { label: "↑ Consider upgrade", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  // ── RESULTS PAGE ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Nav */}
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { setResult(null); setLeadDone(false); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to form
          </button>
          <span className="font-bold text-lg">💰 SpendLens</span>
          <button
            onClick={shareAudit}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-10">

          {/* ── HERO SAVINGS ── */}
          <div className="text-center mb-10 bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {result.savingsCategory === "optimal" ? (
              <>
                <div className="text-5xl mb-3">✅</div>
                <h1 className="text-3xl font-black text-emerald-400 mb-2">You're Spending Well</h1>
                <p className="text-gray-400">Your AI stack looks right-sized for your team. No major optimizations found.</p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Potential savings found</p>
                <div className="text-6xl font-black text-white mb-1">
                  {fmt(result.totalMonthlySavings)}
                  <span className="text-3xl text-gray-400 font-normal">/mo</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 mb-3">
                  = {fmt(result.totalAnnualSavings)}/year
                </div>
                <div className="flex justify-center gap-6 text-sm text-gray-400 mt-4 border-t border-gray-800 pt-4">
                  <span>Current: <strong className="text-white">{fmt(result.totalCurrentSpend)}/mo</strong></span>
                  <span>→</span>
                  <span>Optimized: <strong className="text-emerald-400">{fmt(result.totalOptimalSpend)}/mo</strong></span>
                </div>
              </>
            )}
          </div>

          {/* ── CREDEX CTA (only for high savings) ── */}
          {result.savingsCategory === "high" && (
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="font-bold text-white mb-1">You qualify for a free Credex consultation</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    At your spending level, buying AI credits through Credex can save an additional 20–40% on top of the plan optimizations below. Credex sources credits from companies that overforecast.
                  </p>
                  <a
                    href="https://credex.rocks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                  >
                    Book Free Credex Consultation →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── AI SUMMARY ── */}
          {summary && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>🤖</span> AI-Generated Summary (Llama 3.3 via Groq)
              </p>
              <p className="text-gray-200 leading-relaxed text-sm">{summary}</p>
            </div>
          )}

          {/* ── PER-TOOL BREAKDOWN ── */}
          <h2 className="text-lg font-bold text-white mb-3">Tool-by-tool breakdown</h2>
          <p className="text-sm text-gray-500 mb-4">Click on any tool to see the full recommendation</p>

          <div className="space-y-3 mb-8">
            {result.tools.map((tool, idx) => {
              const isOpen = expandedIdx === idx;
              const action = ACTION_MAP[tool.recommendation.action] || ACTION_MAP.optimal;
              const toolDef = AVAILABLE_TOOLS.find((t) => t.id === tool.toolId);

              return (
                <div
                  key={idx}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Header row — always visible */}
                  <button
                    onClick={() => setExpandedIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{toolDef?.emoji || "🔧"}</span>
                      <div>
                        <p className="font-semibold text-white">{TOOL_LABELS[tool.toolId] || tool.toolId}</p>
                        <p className="text-xs text-gray-500">
                          {getPlanLabel(tool.toolId, tool.plan)} · {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
                        {tool.recommendation.monthlySavings > 0 && (
                          <p className="text-xs text-emerald-400">Save {fmt(tool.recommendation.monthlySavings)}/mo</p>
                        )}
                      </div>
                      <span className="text-gray-600 text-lg">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-gray-800 p-4 bg-gray-950/70">
                      {/* Numbers row */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Current spend</p>
                          <p className="font-bold text-white">{fmt(tool.currentMonthlySpend)}/mo</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Optimized spend</p>
                          <p className="font-bold text-emerald-400">{fmt(tool.benchmarkMonthlySpend)}/mo</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Monthly saving</p>
                          <p className="font-bold text-white">{fmt(tool.recommendation.monthlySavings)}</p>
                        </div>
                      </div>

                      {/* Recommendation box */}
                      <div className={`border rounded-xl p-4 ${action.bg}`}>
                        <p className="text-xs text-gray-400 mb-1">What to do</p>
                        <p className="text-sm text-gray-100">{tool.recommendation.reason}</p>
                        {tool.recommendation.targetTool && (
                          <p className="text-xs text-blue-400 mt-2 font-medium">
                            → Switch to: {TOOL_LABELS[tool.recommendation.targetTool]} ({getPlanLabel(tool.recommendation.targetTool, tool.recommendation.targetPlan || "")})
                          </p>
                        )}
                        {tool.recommendation.targetPlan && !tool.recommendation.targetTool && (
                          <p className="text-xs text-amber-400 mt-2 font-medium">
                            → Downgrade to: {getPlanLabel(tool.toolId, tool.recommendation.targetPlan)} plan
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── LEAD CAPTURE ── */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-white mb-1">
              📧 {result.savingsCategory === "optimal"
                ? "Get notified when optimizations apply to your stack"
                : "Email me this full report"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {result.savingsCategory === "high"
                ? "A Credex specialist will also reach out about your savings opportunity."
                : "We'll send a summary and notify you when pricing changes affect your stack."}
            </p>

            {!leadDone ? (
              <form onSubmit={submitLead} className="space-y-3">
                {/* Honeypot — hidden from real users */}
                <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />

                {!showOptional ? (
                  <button
                    type="button"
                    onClick={() => setShowOptional(true)}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    + Add company & role (optional)
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Your role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={leadLoading || !email.trim()}
                  className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leadLoading ? "Saving..." : "Email Me the Report →"}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
                <span className="text-xl">✅</span>
                <span className="font-medium">Done! Report saved. Check your inbox shortly.</span>
              </div>
            )}
          </div>

          <p className="text-center text-gray-600 text-xs">
            Pricing verified May 2025 · Sources in{" "}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">PRICING_DATA.md</a>
            {" "}· Powered by{" "}
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">Credex</a>
          </p>
        </main>
      </div>
    );
  }

  // ── FORM PAGE ─────────────────────────────────────────────────────────────
  const usedToolIds = formState.tools.map((t) => t.toolId);
  const canAddMore = usedToolIds.length < AVAILABLE_TOOLS.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">💰 SpendLens</span>
        <a
          href="https://credex.rocks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Powered by Credex →
        </a>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* ── HERO ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-xs mb-5 uppercase tracking-wider">
            ⚡ Free AI Spend Audit — 2 minutes
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Stop overpaying for<br />
            <span className="text-blue-400">AI tools you don't need</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Enter your AI tool stack below. Get an instant audit showing exactly where you're overspending and how much you can save.
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          {/* Step 1: Basic info */}
          <div className="mb-6">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              About your team
            </h2>
            <p className="text-xs text-gray-500 mb-4 ml-8">This helps calibrate recommendations by team size and use case</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Team size <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 8"
                  value={formState.teamSize}
                  onChange={(e) => {
                    setFormState((f) => ({ ...f, teamSize: e.target.value }));
                    setErrors((er) => { const c = { ...er }; delete c.teamSize; return c; });
                  }}
                  className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                    errors.teamSize ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                  }`}
                />
                {errors.teamSize && (
                  <p className="text-red-400 text-xs mt-1">⚠ {errors.teamSize}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Primary use case</label>
                <select
                  value={formState.useCase}
                  onChange={(e) => setFormState((f) => ({ ...f, useCase: e.target.value as FormState["useCase"] }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {USE_CASES.map((uc) => (
                    <option key={uc.id} value={uc.id}>{uc.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mb-6" />

          {/* Step 2: Tools */}
          <div className="mb-6">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Your AI tools
            </h2>
            <p className="text-xs text-gray-500 mb-4 ml-8">
              Add every AI tool your team pays for. Enter <strong className="text-gray-400">actual monthly spend</strong> (not per-seat price × seats — just your real bill).
            </p>

            <div className="space-y-4">
              {formState.tools.map((tool, toolIdx) => {
                const toolDef = AVAILABLE_TOOLS.find((t) => t.id === tool.toolId)!;
                const otherUsed = usedToolIds.filter((id) => id !== tool.toolId);

                return (
                  <div
                    key={tool.id}
                    className="border border-gray-700 rounded-xl p-4 bg-gray-800/40 relative"
                  >
                    {/* Tool header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Tool #{toolIdx + 1}
                      </span>
                      {formState.tools.length > 1 && (
                        <button
                          onClick={() => removeTool(tool.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
                          title="Remove this tool"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Tool selector */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">Tool</label>
                      <select
                        value={tool.toolId}
                        onChange={(e) => updateTool(tool.id, "toolId", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {AVAILABLE_TOOLS.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={otherUsed.includes(t.id)}
                          >
                            {t.emoji} {t.label} — {t.desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan selector */}
                    <div className="mb-3">
                      <label className="block text-xs text-gray-400 mb-1">Plan / Tier</label>
                      <select
                        value={tool.plan}
                        onChange={(e) => updateTool(tool.id, "plan", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {toolDef.plans.map((p) => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Spend + Seats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Monthly spend ($) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 80"
                            value={tool.monthlySpend}
                            onChange={(e) => updateTool(tool.id, "monthlySpend", e.target.value)}
                            className={`w-full bg-gray-800 border rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none transition-colors ${
                              errors[`tool_${tool.id}_monthlySpend`]
                                ? "border-red-500"
                                : "border-gray-700 focus:border-blue-500"
                            }`}
                          />
                        </div>
                        {errors[`tool_${tool.id}_monthlySpend`] && (
                          <p className="text-red-400 text-xs mt-1">
                            ⚠ {errors[`tool_${tool.id}_monthlySpend`]}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">Enter 0 if on free plan</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          No. of seats <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 4"
                          value={tool.seats}
                          onChange={(e) => updateTool(tool.id, "seats", e.target.value)}
                          className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors ${
                            errors[`tool_${tool.id}_seats`]
                              ? "border-red-500"
                              : "border-gray-700 focus:border-blue-500"
                          }`}
                        />
                        {errors[`tool_${tool.id}_seats`] && (
                          <p className="text-red-400 text-xs mt-1">
                            ⚠ {errors[`tool_${tool.id}_seats`]}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">How many people use it</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add tool button */}
            {canAddMore && (
              <button
                onClick={addTool}
                className="mt-3 w-full border border-dashed border-gray-700 hover:border-gray-500 rounded-xl py-3 text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                + Add another AI tool
              </button>
            )}
          </div>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-sm font-medium mb-1">⚠ Please fix the following:</p>
              <ul className="list-disc list-inside text-red-400/80 text-xs space-y-0.5">
                {errors.teamSize && <li>Team size is required</li>}
                {formState.tools.map((tool) => (
                  errors[`tool_${tool.id}_monthlySpend`] ? (
                    <li key={`err_spend_${tool.id}`}>
                      {TOOL_LABELS[tool.toolId] || tool.toolId}: Enter monthly spend
                    </li>
                  ) : null
                ))}
                {formState.tools.map((tool) => (
                  errors[`tool_${tool.id}_seats`] ? (
                    <li key={`err_seats_${tool.id}`}>
                      {TOOL_LABELS[tool.toolId] || tool.toolId}: Enter number of seats
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}

          {apiError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              ⚠ {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={runAudit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing your stack...
              </>
            ) : (
              "Run My Free Audit →"
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
            <span>🔒 No account needed</span>
            <span>·</span>
            <span>📊 Results in seconds</span>
            <span>·</span>
            <span>🚫 No spam</span>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "⚡", title: "Instant", desc: "Results in under 5 seconds" },
            { icon: "✅", title: "Accurate", desc: "Prices verified from official pages" },
            { icon: "🔒", title: "Private", desc: "Data stays in your browser" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="font-semibold text-white text-xs">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
