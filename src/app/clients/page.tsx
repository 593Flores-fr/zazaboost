import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AnimatedClients from "./AnimatedClients";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Clients
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/clients/nouveau"
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        >
          + Nouveau client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
          <p className="text-neutral-400 text-sm">Aucun client pour le moment.</p>
          <Link
            href="/clients/nouveau"
            className="mt-4 inline-block bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            Ajouter un client
          </Link>
        </div>
      ) : (
        <AnimatedClients clients={clients} />
      )}
    </div>
  );
}
