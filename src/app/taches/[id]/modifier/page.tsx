import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ModifierTachePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tache, projets] = await Promise.all([
    prisma.task.findUnique({ where: { id }, include: { project: true } }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!tache) notFound();

  async function updateTache(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectId = formData.get("projectId") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;
    const dueDate = formData.get("dueDate") as string;

    await prisma.task.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        projectId: projectId || null,
        status: status as "TODO" | "IN_PROGRESS" | "DONE",
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    revalidatePath("/taches");
    redirect("/taches");
  }

  const toDateInput = (d: Date | null) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/taches" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Modifier la tâche</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <form action={updateTache} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              required
              defaultValue={tache.title}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={tache.description ?? ""}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Statut
              </label>
              <select
                name="status"
                defaultValue={tache.status}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Priorité
              </label>
              <select
                name="priority"
                defaultValue={tache.priority}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Projet associé
            </label>
            <select
              name="projectId"
              defaultValue={tache.projectId ?? ""}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="">— Aucun projet —</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Date d&apos;échéance
            </label>
            <input
              type="date"
              name="dueDate"
              defaultValue={toDateInput(tache.dueDate)}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Enregistrer
            </button>
            <Link
              href="/taches"
              className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
