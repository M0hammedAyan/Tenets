const rows = [
  { ts: "2026-03-06 11:42", level: "Medium", score: 61 },
  { ts: "2026-03-06 10:15", level: "Low", score: 28 },
  { ts: "2026-03-06 08:02", level: "High", score: 82 },
  { ts: "2026-03-06 05:40", level: "Low", score: 19 }
];

const levelStyles = {
  Low: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  Medium: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
  High: "bg-rose-500/10 text-rose-300 ring-rose-500/40"
};

export default function PredictionHistoryTable() {
  return (
    <div className="card card-hover w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Model Prediction History
          </h3>
          <p className="text-[11px] text-slate-400">
            Recent flood risk runs for current configuration.
          </p>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Timestamp</th>
              <th className="px-4 py-2 font-medium">Risk Level</th>
              <th className="px-4 py-2 font-medium">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={`${row.ts}-${idx}`}
                className="border-t border-slate-800/80 hover:bg-slate-900/60"
              >
                <td className="px-4 py-2 text-[13px] text-slate-100">
                  {row.ts}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${levelStyles[row.level]}`}
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {row.level}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-[13px] text-slate-200">
                  {row.score}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

