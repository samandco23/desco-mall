"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#111111" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#111111" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E8E8E8" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#AAAAAA" }}
            interval={4}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#AAAAAA" }}
            width={44}
            tickFormatter={(value: number) =>
              value >= 100_000_000 ? `${Math.round(value / 100_000_000)}M` : `${Math.round(value / 1_000_000)}k`
            }
          />
          <Tooltip
            cursor={{ stroke: "#AAAAAA", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #E8E8E8",
              fontSize: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [formatPrice(Number(value)), "CA"]}
            labelFormatter={(label) => `Journée du ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#111111"
            strokeWidth={1.75}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, fill: "#111111", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
