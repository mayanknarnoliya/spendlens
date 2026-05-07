import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Global cache to avoid re-connecting on every request in dev
let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Lead Schema ──────────────────────────────────────────────────────────────

const LeadSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    companyName: { type: String, default: "" },
    role: { type: String, default: "" },
    teamSize: { type: Number, default: 0 },
    monthlySpend: { type: Number, default: 0 },
    monthlySavings: { type: Number, default: 0 },
    annualSavings: { type: Number, default: 0 },
    savingsCategory: { type: String, default: "low" },
    auditData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
