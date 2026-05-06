import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { FolderOpen, CheckCircle2, TrendingUp, FileText, Clock, AlertCircle } from "lucide-react";
import CAChart from "@/components/CAChart";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    projectsInProgress,
    projectsCompleted,
    tasksTodo,
    tasksInProgress,
    quotesDraft,
    quotesSent,
    quotesAccepted,
    revenueMonth,
    revenueYear,
    acceptedQuotesYear,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.task.count({ where: { status: "TODO" } }),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.quote.count({ where: { status: "DRAFT" } }),
    prisma.quote.count({ where: { status: "SENT" } }),
    prisma.quote.count({ where: { status: "ACCEPTED" } }),
    prisma.quote.aggregate({
      where: { status: "ACCEPTED", issueDate: { gte: startOfMonth } },
      _sum: { totalTTC: true },
    }),
    prisma.quote.aggregate({
      where: { status: "ACCEPTED", issueDate: { gte: startOfYear } },
      _sum: { totalTTC: true },
    }),
    prisma.quote.findMany({
      where: { status: "ACCEPTED", issueDate: { gte: twelveMonthsAgo } },
      select: { issueDate: true, totalTTC: true },
    }),
  ]);

  // Agréger par mois pour le graphique
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap.set(key, 0);
  }
  for (const q of acceptedQuotesYear) {
    const d = new Date(q.issueDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (q.totalTTC ?? 0));
    }
  }
  const chartData = Array.from(monthlyMap.entries()).map(([key, ca]) => {
    const [year, month] = key.split("-").map(Number);
    return { month: MONTH_LABELS[month], ca: Math.round(ca), year };
  });

  return {
    projectsInProgress,
    projectsCompleted,
    tasksTodo,
    tasksInProgress,
    quotesDraft,
    quotesSent,
    quotesAccepted,
    revenueMonth: revenueMonth._sum.totalTTC ?? 0,
    revenueYear: revenueYear._sum.totalTTC ?? 0,
    chartData,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">{title}</span>
        <Icon className="w-4 h-4 text-neutral-300" />
      </div>
      <p className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const stats = await getDashboardData();
  const year = new Date().getFullYear();
  const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(new Date());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-400 mt-1">Bienvenue Allan</p>
      </div>

      {/* CA banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0a] text-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">CA {monthName}</p>
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(stats.revenueMonth)}</p>
          <p className="text-xs text-white/30 mt-1">Devis acceptés ce mois-ci</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-2">CA {year}</p>
          <p className="text-4xl font-bold tracking-tight text-neutral-900">{formatCurrency(stats.revenueYear)}</p>
          <p className="text-xs text-neutral-400 mt-1">Total devis acceptés cette année</p>
        </div>
      </div>

      {/* Graphique CA */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-6">
          Évolution du CA — 12 derniers mois
        </p>
        <CAChart data={stats.chartData} />
      </div>

      {/* Stats — 3 catégories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projets */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Projets</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="En cours" value={stats.projectsInProgress} icon={FolderOpen} />
            <StatCard title="Finalisés" value={stats.projectsCompleted} icon={CheckCircle2} />
          </div>
        </div>

        {/* Tâches */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Tâches</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="À faire" value={stats.tasksTodo} icon={AlertCircle} />
            <StatCard title="En cours" value={stats.tasksInProgress} icon={Clock} />
          </div>
        </div>

        {/* Devis */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">Devis</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="Envoyés" value={stats.quotesSent} icon={FileText} />
            <StatCard title="Acceptés" value={stats.quotesAccepted} icon={TrendingUp} />
          </div>
        </div>
      </div>
    </div>
  );
}
