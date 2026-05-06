import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import AnimatedDevis from "./AnimatedDevis";

export default async function DevisPage() {
  const quotes = await prisma.quote.findMany({
    include: { client: true, project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Devis
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {quotes.length} devis au total
          </p>
        </div>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
          <FileText className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">
            Aucun devis pour l&apos;instant
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            Crée ton premier devis pour commencer
          </p>
        </div>
      ) : (
        <AnimatedDevis quotes={quotes} />
      )}
    </div>
  );
}
