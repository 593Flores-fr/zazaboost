"use client";

import { motion } from "framer-motion";

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

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  jobTitle: string | null;
  _count: { projects: number };
};

export default function AnimatedClients({ clients }: { clients: Client[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {clients.map((client) => (
        <motion.div
          key={client.id}
          variants={item}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-neutral-900 truncate">
                {client.name}
              </h2>
              {client.jobTitle && (
                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  {client.jobTitle}
                </p>
              )}
              {client.company && (
                <p className="text-sm text-neutral-400 mt-0.5 truncate">
                  {client.company}
                </p>
              )}
            </div>
            <span className="ml-2 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
              {client._count.projects} projet
              {client._count.projects !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-1.5 text-sm text-neutral-500">
            {client.email && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-neutral-300 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-neutral-300 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{client.phone}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-neutral-300 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-neutral-900 transition-colors underline underline-offset-2"
                >
                  {client.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {!client.email && !client.phone && !client.website && (
              <p className="text-neutral-300 italic">Aucune coordonnée</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
