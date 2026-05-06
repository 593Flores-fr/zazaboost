import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/generated/prisma/enums";
import AnimatedTaches from "./AnimatedTaches";

const statusLabels: Record<string, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
};

interface TachesPageProps {
  searchParams: Promise<{ statut?: string }>;
}

export default async function TachesPage({ searchParams }: TachesPageProps) {
  const { statut } = await searchParams;

  const validStatuts: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
  const filtreStatut =
    statut && validStatuts.includes(statut as TaskStatus)
      ? (statut as TaskStatus)
      : undefined;

  const taches = await prisma.task.findMany({
    where: filtreStatut ? { status: filtreStatut } : undefined,
    include: {
      project: true,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Tâches
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {taches.length} tâche{taches.length !== 1 ? "s" : ""}
            {filtreStatut ? ` · filtre : ${statusLabels[filtreStatut]}` : ""}
          </p>
        </div>
        <Link
          href="/taches/nouvelle"
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        >
          + Nouvelle tâche
        </Link>
      </div>

      {/* Filtres par statut */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/taches"
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            !filtreStatut
              ? "bg-[#0a0a0a] text-white"
              : "bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
          }`}
        >
          Toutes
        </Link>
        {validStatuts.map((s) => (
          <Link
            key={s}
            href={`/taches?statut=${s}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              filtreStatut === s
                ? "bg-[#0a0a0a] text-white"
                : "bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
            }`}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      {taches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
          <p className="text-neutral-400 text-sm">
            {filtreStatut
              ? `Aucune tâche avec le statut « ${statusLabels[filtreStatut]} ».`
              : "Aucune tâche pour le moment."}
          </p>
          <Link
            href="/taches/nouvelle"
            className="mt-4 inline-block bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            Créer une tâche
          </Link>
        </div>
      ) : (
        <AnimatedTaches taches={taches} />
      )}
    </div>
  );
}
