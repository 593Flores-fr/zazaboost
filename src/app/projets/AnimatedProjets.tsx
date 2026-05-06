"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  IN_PROGRESS: { label: "En cours",  className: "bg-neutral-900 text-white" },
  COMPLETED:   { label: "Terminé",   className: "bg-neutral-700 text-white" },
  ON_HOLD:     { label: "En pause",  className: "bg-neutral-100 text-neutral-600" },
  CANCELLED:   { label: "Annulé",    className: "bg-neutral-200 text-neutral-500" },
};

type Projet = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: Date;
  client: { name: string } | null;
  _count: { tasks: number };
};

export default function AnimatedProjets({ projets: initial }: { projets: Projet[] }) {
  const [projets, setProjets] = useState(initial);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/projets/${id}`, { method: "DELETE" });
    setProjets(ps => ps.filter(p => p.id !== id));
    setConfirming(null);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-100 bg-neutral-50">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Titre</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Client</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Statut</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Début</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Tâches</th>
            <th className="px-6 py-3 w-24" />
          </tr>
        </thead>
        <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-neutral-100">
          <AnimatePresence>
            {projets.map((projet) => {
              const status = statusConfig[projet.status] ?? { label: projet.status, className: "bg-neutral-100 text-neutral-600" };
              const isConfirming = confirming === projet.id;
              const isDeleting = deleting === projet.id;

              return (
                <motion.tr
                  key={projet.id}
                  variants={item}
                  exit={{ opacity: 0, height: 0 }}
                  className="group hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{projet.title}</span>
                    {projet.description && (
                      <p className="text-neutral-400 text-xs mt-0.5 line-clamp-1">{projet.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">
                    {projet.client ? projet.client.name : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{formatDate(projet.startDate)}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {projet._count.tasks} tâche{projet._count.tasks !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isConfirming ? (
                        <>
                          <Link
                            href={`/projets/${projet.id}/modifier`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setConfirming(projet.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(projet.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Confirmer"}
                          </button>
                          <button
                            onClick={() => setConfirming(null)}
                            className="px-2 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-medium hover:bg-neutral-200 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
}
