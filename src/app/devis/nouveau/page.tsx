"use server";

import { prisma } from "@/lib/prisma";
import { generateQuoteNumber } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createQuote(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const clientId = formData.get("clientId") as string;
  const projectId = formData.get("projectId") as string;
  const validUntil = formData.get("validUntil") as string;
  const tva = parseFloat(formData.get("tva") as string) || 20;
  const notes = formData.get("notes") as string;

  const descriptions = formData.getAll("item_description") as string[];
  const quantities = formData.getAll("item_quantity") as string[];
  const unitPrices = formData.getAll("item_unitPrice") as string[];

  const items = descriptions
    .map((desc, i) => ({
      description: desc,
      quantity: parseFloat(quantities[i]) || 1,
      unitPrice: parseFloat(unitPrices[i]) || 0,
      total: (parseFloat(quantities[i]) || 1) * (parseFloat(unitPrices[i]) || 0),
    }))
    .filter((item) => item.description.trim() !== "");

  const totalHT = items.reduce((sum, item) => sum + item.total, 0);
  const totalTTC = totalHT * (1 + tva / 100);

  await prisma.quote.create({
    data: {
      number: generateQuoteNumber(),
      title,
      tva,
      totalHT,
      totalTTC,
      notes: notes || null,
      validUntil: validUntil ? new Date(validUntil) : null,
      clientId: clientId || null,
      projectId: projectId || null,
      items: { create: items },
    },
  });

  redirect("/devis");
}

export default async function NouveauDevisPage() {
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      where: { status: "IN_PROGRESS" },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/devis" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>

      <form action={createQuote} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du devis <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex : Création identité visuelle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                name="clientId"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Aucun client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projet lié</label>
              <select
                name="projectId"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Aucun projet —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valable jusqu&apos;au</label>
              <input
                type="date"
                name="validUntil"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
              <input
                type="number"
                name="tva"
                defaultValue="20"
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Prestations</h2>
          <div className="space-y-3" id="items-container">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qté</span>
              <span className="col-span-2 text-right">Prix unit. HT</span>
              <span className="col-span-2 text-right">Total HT</span>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  name="item_description"
                  className="col-span-6 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={i === 0 ? "Ex : Création logo" : ""}
                />
                <input
                  type="number"
                  name="item_quantity"
                  defaultValue="1"
                  min="0"
                  step="0.5"
                  className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  name="item_unitPrice"
                  defaultValue="0"
                  min="0"
                  step="0.01"
                  className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="col-span-2 text-sm text-gray-400 text-right pr-1">—</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes / conditions</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Conditions de paiement, délais, remarques..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Créer le devis
          </button>
          <Link
            href="/devis"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
