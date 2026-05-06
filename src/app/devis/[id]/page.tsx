import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import QuoteActions from "./QuoteActions";

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

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, project: true, items: true },
  });

  if (!quote) notFound();

  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/devis"
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {quote.title}
            </h1>
            <p className="text-neutral-400 text-sm mt-0.5 font-mono">
              {quote.number}
            </p>
          </div>
          <span
            className={`inline-flex text-sm font-medium px-3 py-1 rounded-full ${statusColor[quote.status] ?? "bg-neutral-100 text-neutral-600"}`}
          >
            {statusLabel[quote.status] ?? quote.status}
          </span>
          <Link
            href={`/devis/${quote.id}/pdf`}
            className="flex items-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            PDF
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                Client
              </p>
              <p className="text-sm text-neutral-900">
                {quote.client?.name ?? "—"}
              </p>
              {quote.client?.email && (
                <p className="text-sm text-neutral-500">{quote.client.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                Projet
              </p>
              <p className="text-sm text-neutral-900">
                {quote.project?.title ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                Date d&apos;émission
              </p>
              <p className="text-sm text-neutral-900">
                {formatDate(quote.issueDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
                Valable jusqu&apos;au
              </p>
              <p className="text-sm text-neutral-900">
                {quote.validUntil ? formatDate(quote.validUntil) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
                  Description
                </th>
                <th className="text-right text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
                  Qté
                </th>
                <th className="text-right text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
                  Prix unit.
                </th>
                <th className="text-right text-xs font-semibold text-neutral-400 uppercase tracking-widest px-6 py-3">
                  Total HT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-neutral-50 border-t border-neutral-100">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-sm text-right text-neutral-500"
                >
                  Total HT
                </td>
                <td className="px-6 py-3 text-sm font-medium text-neutral-900 text-right">
                  {formatCurrency(quote.totalHT)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-sm text-right text-neutral-500"
                >
                  TVA ({quote.tva}%)
                </td>
                <td className="px-6 py-3 text-sm text-neutral-500 text-right">
                  {formatCurrency(quote.totalTTC - quote.totalHT)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 text-sm font-bold text-right text-neutral-900"
                >
                  Total TTC
                </td>
                <td className="px-6 py-4 text-base font-bold text-neutral-900 text-right">
                  {formatCurrency(quote.totalTTC)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {quote.notes && (
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 mb-6">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
              Notes
            </p>
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">
              {quote.notes}
            </p>
          </div>
        )}

        <QuoteActions quoteId={quote.id} currentStatus={quote.status} />
      </div>
    </div>
  );
}
