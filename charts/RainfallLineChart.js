import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const data = [
  { time: "00:00", mm: 2 },
  { time: "03:00", mm: 8 },
  { time: "06:00", mm: 14 },
  { time: "09:00", mm: 26 },
  { time: "12:00", mm: 32 },
  { time: "15:00", mm: 40 },
  { time: "18:00", mm: 48 },
  { time: "21:00", mm: 54 }
];

export default function RainfallLineChart() {
  return (
    <div className="card card-hover h-[280px] w-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            24h Statewide Rainfall Trend
          </h3>
          <p className="text-[11px] text-slate-400">
            Based on IMD automatic rain gauge network (provisional).
          </p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-300 ring-1 ring-cyan-500/40">
          Last 24 hours
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            tickLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            stroke="#9ca3af"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            fontSize={11}
            tickFormatter={(v) => `${v}mm`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 10,
              fontSize: 12
            }}
            labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="mm"
            stroke="#22d3ee"
            strokeWidth={2.2}
            dot={{ r: 3, strokeWidth: 1, stroke: "#22d3ee", fill: "#020617" }}
            activeDot={{
              r: 5,
              stroke: "#22d3ee",
              strokeWidth: 2,
              fill: "#0f172a"
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

