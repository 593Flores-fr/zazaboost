import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { TaskStatus, Priority } from "@/generated/prisma/enums";

async function createTache(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const status = formData.get("status") as TaskStatus;
  const priority = formData.get("priority") as Priority;
  const dueDateRaw = formData.get("dueDate") as string | null;

  if (!title?.trim()) return;

  await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      projectId: projectId || null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/taches");
  redirect("/taches");
}

export default async function NouvelleTachePage() {
  const projets = await prisma.project.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/taches"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 inline-block"
        >
          ← Retour aux tâches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle tâche</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={createTache} className="space-y-5">
          {/* Titre */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Nom de la tâche"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Description de la tâche (optionnel)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Projet */}
          <div>
            <label
              htmlFor="projectId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Projet associé
            </label>
            <select
              id="projectId"
              name="projectId"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">— Aucun projet —</option>
              {projets.map((projet) => (
                <option key={projet.id} value={projet.id}>
                  {projet.title}
                </option>
              ))}
            </select>
          </div>

          {/* Statut et priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Statut
              </label>
              <select
                id="status"
                name="status"
                defaultValue="TODO"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Terminé</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Priorité
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Date d&apos;échéance
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Créer la tâche
            </button>
            <Link
              href="/taches"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
