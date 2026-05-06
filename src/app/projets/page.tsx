import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AnimatedProjets from "./AnimatedProjets";

export default async function ProjetsPage() {
  const projets = await prisma.project.findMany({
    include: {
      client: true,
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Projets
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {projets.length} projet{projets.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/projets/nouveau"
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        >
          + Nouveau projet
        </Link>
      </div>

      {projets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
          <p className="text-neutral-400 text-sm">Aucun projet pour le moment.</p>
          <Link
            href="/projets/nouveau"
            className="mt-4 inline-block bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            Créer un projet
          </Link>
        </div>
      ) : (
        <AnimatedProjets projets={projets} />
      )}
    </div>
  );
}
