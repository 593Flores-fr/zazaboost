"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  ca: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="text-white/70 text-xs mt-0.5">
        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(payload[0].value)}
      </p>
    </div>
  );
}

export default function CAChart({ data }: { data: DataPoint[] }) {
  const hasData = data.some((d) => d.ca > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
        Aucun CA enregistré — accepte ton premier devis pour voir le graphique
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
          width={55}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#0a0a0a", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="ca"
          stroke="#0a0a0a"
          strokeWidth={2}
          fill="url(#caGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#0a0a0a", strokeWidth: 0 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
