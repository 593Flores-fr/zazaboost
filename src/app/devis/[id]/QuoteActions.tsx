"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const nextStatus: Record<
  string,
  { label: string; value: string } | null
> = {
  DRAFT: { label: "Marquer comme envoyé", value: "SENT" },
  SENT: { label: "Marquer comme accepté", value: "ACCEPTED" },
  ACCEPTED: null,
  REJECTED: null,
};

export default function QuoteActions({
  quoteId,
  currentStatus,
}: {
  quoteId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const next = nextStatus[currentStatus];

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      await fetch(`/api/devis/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await fetch(`/api/devis/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      router.refresh();
    });
  };

  if (!next && currentStatus !== "SENT") return null;

  return (
    <div className="flex gap-3">
      {next && (
        <button
          onClick={() => handleStatusChange(next.value)}
          disabled={isPending}
          className="bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
        >
          {isPending ? "..." : next.label}
        </button>
      )}
      {currentStatus === "SENT" && (
        <button
          onClick={handleReject}
          disabled={isPending}
          className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
        >
          Marquer comme refusé
        </button>
      )}
    </div>
  );
}
