import type { Metadata } from "next";
import SpendLensApp from "@/components/SpendLensApp";

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit for Startups",
  description: "Find out where you're overspending on AI tools. Free audit in 2 minutes. No account required.",
  openGraph: {
    title: "SpendLens — Free AI Spend Audit",
    description: "Find out where you're overspending on AI tools. Free audit in 2 minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit",
    description: "Find out where you're overspending on AI tools. Free audit in 2 minutes.",
  },
};

export default function Home() {
  return <SpendLensApp />;
}
