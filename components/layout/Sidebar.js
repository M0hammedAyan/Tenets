import Link from "next/link";
import { useRouter } from "next/router";
import { Gauge, CloudRain, Waves, BrainCircuit, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    href: "/",
    label: "Dashboard Overview",
    icon: Gauge
  },
  {
    href: "/rainfall",
    label: "Rainfall Monitoring",
    icon: CloudRain
  },
  {
    href: "/rivers",
    label: "River Monitoring",
    icon: Waves
  },
  {
    href: "/prediction",
    label: "Flood Prediction",
    icon: BrainCircuit
  }
];

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-800 bg-surface/90 backdrop-blur-xl transition-all duration-200 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-400/40">
            <span className="text-lg font-semibold text-cyan-300">KF</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Karnataka
              </span>
              <span className="text-sm font-semibold text-slate-100">
                Flood Early Warning
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/40"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-cyan-200"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-base ${
                  active
                    ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-700 bg-slate-900/60 text-slate-300 group-hover:border-cyan-500/60 group-hover:text-cyan-300"
                }`}
              >
                <Icon />
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-500">
        {!collapsed && (
          <>
            <p className="font-semibold text-slate-400">
              Karnataka State Disaster Management
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              Internal monitoring console for real-time flood surveillance and
              early warning operations.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}

