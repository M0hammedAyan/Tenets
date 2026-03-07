const rows = [
  { district: "Kodagu", h24: 186, d7: 432, risk: "High" },
  { district: "Uttara Kannada", h24: 142, d7: 380, risk: "High" },
  { district: "Shivamogga", h24: 98, d7: 240, risk: "Medium" },
  { district: "Belagavi", h24: 62, d7: 168, risk: "Medium" },
  { district: "Bengaluru Urban", h24: 38, d7: 96, risk: "Low" }
];

const riskColors = {
  Low: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  Medium: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
  High: "bg-rose-500/10 text-rose-300 ring-rose-500/40"
};

export default function DistrictRainfallTable() {
  return (
    <div className="card card-hover w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            District Rainfall Summary
          </h3>
          <p className="text-[11px] text-slate-400">
            Key districts with significant 24h and 7-day accumulations.
          </p>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">District</th>
              <th className="px-4 py-2 font-medium">Rainfall (24h)</th>
              <th className="px-4 py-2 font-medium">Rainfall (7 days)</th>
              <th className="px-4 py-2 font-medium">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.district}
                className="border-t border-slate-800/80 hover:bg-slate-900/60"
              >
                <td className="px-4 py-2 text-[13px] text-slate-100">
                  {row.district}
                </td>
                <td className="px-4 py-2 font-mono text-[13px] text-cyan-200">
                  {row.h24} mm
                </td>
                <td className="px-4 py-2 font-mono text-[13px] text-slate-200">
                  {row.d7} mm
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${riskColors[row.risk]}`}
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {row.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

