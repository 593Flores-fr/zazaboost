import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createProjet(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const clientId = formData.get("clientId") as string | null;
  const startDateRaw = formData.get("startDate") as string | null;
  const endDateRaw = formData.get("endDate") as string | null;

  if (!title?.trim()) return;

  await prisma.project.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      clientId: clientId || null,
      startDate: startDateRaw ? new Date(startDateRaw) : new Date(),
      endDate: endDateRaw ? new Date(endDateRaw) : null,
    },
  });

  revalidatePath("/projets");
  redirect("/projets");
}

export default async function NouveauProjetPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/projets"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 inline-block"
        >
          ← Retour aux projets
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau projet</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={createProjet} className="space-y-5">
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
              placeholder="Nom du projet"
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
              rows={4}
              placeholder="Description du projet (optionnel)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Client */}
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">— Aucun client —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                  {client.company ? ` (${client.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Date de début
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Date de fin
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Créer le projet
            </button>
            <Link
              href="/projets"
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
