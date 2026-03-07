import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";

const data = [
  { time: "00:00", level: 355.2 },
  { time: "03:00", level: 355.7 },
  { time: "06:00", level: 356.3 },
  { time: "09:00", level: 356.9 },
  { time: "12:00", level: 357.4 },
  { time: "15:00", level: 357.9 },
  { time: "18:00", level: 358.3 },
  { time: "21:00", level: 358.6 }
];

const dangerLevel = 359.0;

export default function RiverLevelChart() {
  return (
    <div className="card card-hover h-[280px] w-full p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            River Level Trend – Tungabhadra (Hosapete)
          </h3>
          <p className="text-[11px] text-slate-400">
            Gauge levels relative to danger level (m).
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-0.5 text-slate-300">
            <span className="h-1.5 w-5 rounded-full bg-cyan-400" />
            Observed
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-0.5 text-rose-300">
            <span className="h-1 w-5 rounded-full border border-dashed border-rose-400" />
            Danger level
          </span>
        </div>
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
            tickFormatter={(v) => `${v.toFixed(1)}m`}
            domain={["dataMin - 0.5", "dataMax + 0.5"]}
          />
          <ReferenceLine
            y={dangerLevel}
            stroke="#fb7185"
            strokeDasharray="4 4"
            strokeWidth={1.2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 10,
              fontSize: 12
            }}
            labelStyle={{ color: "#e5e7eb", marginBottom: 4 }}
            formatter={(value) => [`${value.toFixed(2)} m`, "Level"]}
          />
          <Line
            type="monotone"
            dataKey="level"
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

