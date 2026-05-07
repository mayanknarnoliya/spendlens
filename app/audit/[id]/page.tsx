import { Metadata } from "next";

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const savings = searchParams.savings || "0";
  const annual = searchParams.annual || "0";

  return {
    title: `AI Spend Audit — $${Number(savings).toLocaleString()}/mo in savings found | SpendLens`,
    description: `This AI stack audit found $${Number(savings).toLocaleString()}/month ($${Number(annual).toLocaleString()}/year) in potential savings. Check your own AI tool spend free at SpendLens.`,
    openGraph: {
      title: `AI Spend Audit — $${Number(savings).toLocaleString()}/mo savings found`,
      description: `Free AI tool spend audit found $${Number(annual).toLocaleString()}/year in savings. See your audit at SpendLens.`,
      type: "website",
      images: [
        {
          url: `/api/og?savings=${savings}&annual=${annual}`,
          width: 1200,
          height: 630,
          alt: "SpendLens AI Spend Audit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit — $${Number(savings).toLocaleString()}/mo savings found`,
      description: `Free AI tool spend audit found $${Number(annual).toLocaleString()}/year in savings.`,
      images: [`/api/og?savings=${savings}&annual=${annual}`],
    },
  };
}

export default function SharedAuditPage({ params, searchParams }: Props) {
  const savings = searchParams.savings || "0";
  const annual = searchParams.annual || "0";
  const tools = searchParams.tools || "";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm mb-6">
            SpendLens AI Audit Report
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            ${Number(savings).toLocaleString()}
            <span className="text-gray-400 text-3xl font-normal">/mo</span>
          </h1>
          <p className="text-xl text-gray-400">
            in potential savings found — ${Number(annual).toLocaleString()}/year
          </p>
        </div>

        {tools && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <p className="text-gray-400 text-sm mb-2">Tools analyzed</p>
            <p className="text-white">{decodeURIComponent(String(tools))}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-400 mb-6">Want to see your own AI spend audit?</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Run Your Free Audit →
          </a>
          <p className="text-gray-600 text-sm mt-4">Free · No account required · 2 minutes</p>
        </div>
      </div>
    </div>
  );
}
