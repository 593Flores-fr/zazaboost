import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ModifierProjetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [projet, clients] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { client: true } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!projet) notFound();

  async function updateProjet(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const clientId = formData.get("clientId") as string;
    const status = formData.get("status") as string;
    const endDate = formData.get("endDate") as string;

    await prisma.project.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        clientId: clientId || null,
        status: status as "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED",
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    revalidatePath("/projets");
    redirect("/projets");
  }

  const toDateInput = (d: Date | null) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/projets" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Modifier le projet</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <form action={updateProjet} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              required
              defaultValue={projet.title}
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
              defaultValue={projet.description ?? ""}
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
                defaultValue={projet.status}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminé</option>
                <option value="ON_HOLD">En pause</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Client
              </label>
              <select
                name="clientId"
                defaultValue={projet.clientId ?? ""}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              >
                <option value="">— Aucun —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={toDateInput(projet.endDate)}
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
              href="/projets"
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
