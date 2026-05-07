import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit",
  description: "Find out where you're overspending on AI tools. Free audit in 2 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
