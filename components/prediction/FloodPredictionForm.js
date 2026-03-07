import { useState } from "react";

const fields = [
  {
    key: "rain3h",
    label: "3-Hour Rainfall (mm)",
    min: 0,
    max: 200,
    step: 1
  },
  {
    key: "rain24h",
    label: "24-Hour Rainfall (mm)",
    min: 0,
    max: 500,
    step: 1
  },
  {
    key: "soil",
    label: "Soil Moisture (%)",
    min: 0,
    max: 100,
    step: 1
  },
  {
    key: "elevation",
    label: "Elevation (m)",
    min: 0,
    max: 2500,
    step: 10
  },
  {
    key: "slope",
    label: "Slope (degrees)",
    min: 0,
    max: 45,
    step: 1
  },
  {
    key: "proximity",
    label: "River Proximity (km)",
    min: 0,
    max: 20,
    step: 0.5
  }
];

function computeRisk(values) {
  let score =
    values.rain24h * 0.25 +
    values.rain3h * 0.35 +
    values.soil * 0.15 +
    (20 - Math.min(values.proximity, 20)) * 3 +
    values.slope * 0.2;

  if (values.elevation > 900) score -= 15;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level = "Low";
  if (score >= 70) level = "High";
  else if (score >= 40) level = "Medium";

  return { score, level };
}

export default function FloodPredictionForm({ onResult }) {
  const [values, setValues] = useState({
    rain3h: 35,
    rain24h: 120,
    soil: 68,
    elevation: 720,
    slope: 7,
    proximity: 2.5
  });

  function handleChange(key, value) {
    setValues((prev) => ({
      ...prev,
      [key]: Number(value)
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const result = computeRisk(values);
    onResult?.(result);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card card-hover flex h-full flex-col gap-4 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Flood Prediction Inputs
          </h3>
          <p className="text-[11px] text-slate-400">
            Configure hydrometeorological parameters for the AI risk model.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="flex justify-between text-[11px] text-slate-300">
              <span>{field.label}</span>
              <span className="font-mono text-[10px] text-slate-400">
                {values[field.key]}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
              />
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-20 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-right text-xs text-slate-100 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/60"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
        >
          Predict Flood Risk
        </button>
      </div>
    </form>
  );
}

