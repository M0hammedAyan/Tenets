import Head from "next/head";
import Sidebar from "./Sidebar";

export default function Layout({ title, children }) {
  const pageTitle =
    title || "Karnataka Flood Prediction & Early Warning System";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-50">
                  Karnataka Flood Prediction &amp; Early Warning System
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Real-time situational awareness dashboard for state-level
                  disaster response coordination.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40" />
                  <span className="font-medium text-emerald-200">
                    Live monitoring
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    IMD Radar Sync
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Last update: &lt; 3 min ago
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 pb-10 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

