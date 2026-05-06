import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function createClient(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const company = formData.get("company") as string | null;
  const jobTitle = formData.get("jobTitle") as string | null;
  const website = formData.get("website") as string | null;

  if (!name?.trim()) return;

  await prisma.client.create({
    data: {
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      jobTitle: jobTitle?.trim() || null,
      website: website?.trim() || null,
    },
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export default function NouveauClientPage() {
  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="max-w-2xl">
        <div className="mb-8">
          <Link
            href="/clients"
            className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-2 inline-block"
          >
            ← Retour aux clients
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Nouveau client
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
          <form action={createClient} className="space-y-5">
            {/* Nom */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Nom <span className="text-neutral-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Nom du client"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Intitulé de fonction */}
            <div>
              <label
                htmlFor="jobTitle"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Intitulé de fonction
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="Ex : Directeur Marketing"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Entreprise */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Entreprise
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Nom de l'entreprise (optionnel)"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@exemple.com"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="06 00 00 00 00"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Site web */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Site web
              </label>
              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://..."
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Créer le client
              </button>
              <Link
                href="/clients"
                className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
