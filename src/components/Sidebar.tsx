"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CheckSquare,
  Users,
  Share2,
  Zap,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projets", label: "Projets", icon: FolderOpen },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/taches", label: "Tâches", icon: CheckSquare },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/calendrier", label: "Calendrier", icon: CalendarDays },
  { href: "/reseaux", label: "Réseaux", icon: Share2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#0a0a0a] text-white flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-black" fill="black" />
          </div>
          <span className="font-bold text-base tracking-tight">Zazaboost</span>
        </div>
        <p className="text-[11px] text-white/30 mt-1.5 ml-9">Espace de travail</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white text-black"
                  : "text-white/50 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/25 font-medium">Allan · Graphiste</p>
      </div>
    </aside>
  );
}
