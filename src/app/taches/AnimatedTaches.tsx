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

const taskStatusConfig: Record<string, { label: string; className: string }> = {
  TODO:        { label: "À faire",  className: "bg-neutral-100 text-neutral-600" },
  IN_PROGRESS: { label: "En cours", className: "bg-neutral-900 text-white" },
  DONE:        { label: "Terminé",  className: "bg-neutral-700 text-white" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  HIGH:   { label: "Haute",   className: "bg-neutral-900 text-white" },
  MEDIUM: { label: "Moyenne", className: "bg-neutral-400 text-white" },
  LOW:    { label: "Basse",   className: "bg-neutral-100 text-neutral-500" },
};

type Tache = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: { title: string } | null;
};

export default function AnimatedTaches({ taches: initial }: { taches: Tache[] }) {
  const [taches, setTaches] = useState(initial);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/taches/${id}`, { method: "DELETE" });
    setTaches(ts => ts.filter(t => t.id !== id));
    setConfirming(null);
    setDeleting(null);
    router.refresh();
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      <AnimatePresence>
        {taches.map((tache) => {
          const status = taskStatusConfig[tache.status] ?? { label: tache.status, className: "bg-neutral-100 text-neutral-600" };
          const priority = priorityConfig[tache.priority] ?? { label: tache.priority, className: "bg-neutral-100 text-neutral-500" };
          const isConfirming = confirming === tache.id;
          const isDeleting = deleting === tache.id;

          return (
            <motion.div
              key={tache.id}
              variants={item}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="group bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 px-5 py-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-neutral-900 truncate">{tache.title}</h2>
                {tache.description && (
                  <p className="text-sm text-neutral-400 mt-0.5 line-clamp-1">{tache.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priority.className}`}>
                    {priority.label}
                  </span>
                  {tache.project && (
                    <span className="text-xs text-neutral-400">· {tache.project.title}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {tache.dueDate && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Échéance</p>
                    <p className="text-sm font-medium text-neutral-700">{formatDate(tache.dueDate)}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isConfirming ? (
                    <>
                      <Link
                        href={`/taches/${tache.id}/modifier`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setConfirming(tache.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(tache.id)}
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
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
