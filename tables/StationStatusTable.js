const stations = [
  {
    name: "Hosapete",
    river: "Tungabhadra",
    current: 358.6,
    danger: 359.0,
    status: "Danger"
  },
  {
    name: "Srirangapatna",
    river: "Kaveri",
    current: 757.2,
    danger: 758.0,
    status: "Warning"
  },
  {
    name: "Almatti Dam",
    river: "Krishna",
    current: 515.4,
    danger: 517.0,
    status: "Safe"
  },
  {
    name: "Shivamogga",
    river: "Tunga",
    current: 274.1,
    danger: 275.0,
    status: "Warning"
  }
];

const statusStyles = {
  Safe: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40",
  Warning: "bg-amber-500/10 text-amber-300 ring-amber-500/40",
  Danger: "bg-rose-500/10 text-rose-300 ring-rose-500/40"
};

export default function StationStatusTable() {
  return (
    <div className="card card-hover w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            River Gauge Station Status
          </h3>
          <p className="text-[11px] text-slate-400">
            Live station readings compared against danger levels.
          </p>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Station Name</th>
              <th className="px-4 py-2 font-medium">River Name</th>
              <th className="px-4 py-2 font-medium">Current Level (m)</th>
              <th className="px-4 py-2 font-medium">Danger Level (m)</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((st) => (
              <tr
                key={st.name}
                className="border-t border-slate-800/80 hover:bg-slate-900/60"
              >
                <td className="px-4 py-2 text-[13px] text-slate-100">
                  {st.name}
                </td>
                <td className="px-4 py-2 text-[13px] text-slate-200">
                  {st.river}
                </td>
                <td className="px-4 py-2 font-mono text-[13px] text-cyan-200">
                  {st.current.toFixed(2)}
                </td>
                <td className="px-4 py-2 font-mono text-[13px] text-slate-200">
                  {st.danger.toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusStyles[st.status]}`}
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {st.status}
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

