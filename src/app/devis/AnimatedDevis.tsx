"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Eye } from "lucide-react";

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

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
};

const statusColor: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  SENT: "bg-neutral-800 text-white",
  ACCEPTED: "bg-neutral-900 text-white",
  REJECTED: "bg-neutral-200 text-neutral-500",
};

type Quote = {
  id: string;
  number: string;
  title: string;
  status: string;
  issueDate: Date;
  totalTTC: number;
  client: { name: string } | null;
  project: { title: string } | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function AnimatedDevis({ quotes }: { quotes: Quote[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-100">
          <tr>
            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              N°
            </th>
            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              Titre
            </th>
            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              Client
            </th>
            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              Statut
            </th>
            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              Date
            </th>
            <th className="text-right text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
              Total TTC
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <motion.tbody
          variants={container}
          initial="hidden"
          animate="show"
          className="divide-y divide-neutral-100"
        >
          {quotes.map((quote) => (
            <motion.tr
              key={quote.id}
              variants={item}
              className="hover:bg-neutral-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-mono text-neutral-400">
                {quote.number}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                {quote.title}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-500">
                {quote.client?.name ?? "—"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[quote.status] ?? "bg-neutral-100 text-neutral-600"}`}
                >
                  {statusLabel[quote.status] ?? quote.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-neutral-500">
                {formatDate(quote.issueDate)}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                {formatCurrency(quote.totalTTC)}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/devis/${quote.id}`}
                  className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </Link>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
