// apps/web/src/components/auth/AuthProductShowcase.tsx
// Interactive sliding product visual showcase for the left side of Login & Sign Up pages

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity, Sparkles, Layers } from "lucide-react";

interface ShowcaseSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  metrics: { label: string; value: string }[];
}

const SLIDES: ShowcaseSlide[] = [
  {
    id: "rop-engine",
    tag: "CONTINUOUS REVIEW (s, Q) ENGINE",
    title: "Deterministic Reorder Points before stockouts happen.",
    subtitle:
      "Real-time inventory position tracking against dual-variance Safety Stock and Economic Order Quantity (EOQ) thresholds.",
    metrics: [
      { label: "Service Target", value: "95.0% (z=1.645)" },
      { label: "Trigger Formula", value: "μ_d·L + z·σ_LT" },
      { label: "Output Rounding", value: "Pack & MOQ Ceil" },
    ],
  },
  {
    id: "anomaly-guard",
    tag: "MODIFIED Z-SCORE ANOMALY SHIELD",
    title: "Intercepts data typos & promo spikes automatically.",
    subtitle:
      "Flags unusual observations (|M_i| > 3.5) on the training window so barcode slips never inflate your safety buffer.",
    metrics: [
      { label: "Outlier Filter", value: "|M_i| > 3.5 MAD" },
      { label: "AI Advisory Bound", value: "Clamped ±30%" },
      { label: "Data Leakage", value: "0% (Train Only)" },
    ],
  },
  {
    id: "monte-carlo",
    tag: "MONTE CARLO STRESS SIMULATION",
    title: "10,000-trial seeded risk verification in milliseconds.",
    subtitle:
      "Cross-checks analytic stockout probability against mulberry32 PRNG simulations under supplier delays and demand surges.",
    metrics: [
      { label: "PRNG Engine", value: "mulberry32 Seed" },
      { label: "Simulations", value: "10,000 Trials" },
      { label: "Provenance", value: "100% Auditable" },
    ],
  },
];

export const AuthProductShowcase: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative h-full w-full rounded-2xl border border-[#ebebeb] dark:border-[#262626] bg-[#111111] text-[#f5f5f5] p-7 sm:p-9 flex flex-col justify-between overflow-hidden select-none shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      {/* Subtle architectural background grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #262626 1px, transparent 1px), linear-gradient(to bottom, #262626 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.06) 0%, rgba(17,17,17,0.92) 75%)",
        }}
      />

      {/* Top Brand & Live Status Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="StockSense" className="w-7 h-7 rounded-md" />
          <div>
            <span className="font-heading text-sm font-semibold tracking-tight text-white block leading-none">
              StockSense
            </span>
            <span className="font-mono text-[10px] text-[#a3a3a3]">
              @stocksense/core · Replenishment OS
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1c1c] border border-[#2e2e2e] text-[10px] font-mono text-[#d4d4d4]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Deterministic Engine Ready</span>
        </div>
      </div>

      {/* Center Sliding Visual Viewport */}
      <div className="relative z-10 my-6 overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a]/90">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {/* SLIDE 1 VISUAL: Sawtooth Inventory Trajectory & ROP Threshold */}
          <div className="w-full shrink-0 p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a3a3] border-b border-[#1f1f1f] pb-2.5">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                PCM-02 · Paracetamol 500mg
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Pos (300) ≤ ROP (665) · Order +350 u
              </span>
            </div>

            <svg viewBox="0 0 460 185" className="w-full h-44 block overflow-visible">
              {/* Horizontal Grid Lines */}
              <line x1="30" y1="25" x2="445" y2="25" stroke="#1f1f1f" strokeWidth="1" />
              <line x1="30" y1="75" x2="445" y2="75" stroke="#1f1f1f" strokeWidth="1" />
              <line x1="30" y1="125" x2="445" y2="125" stroke="#1f1f1f" strokeWidth="1" />
              <line x1="30" y1="160" x2="445" y2="160" stroke="#262626" strokeWidth="1" />

              {/* Safety Stock Shaded Band */}
              <rect x="30" y="128" width="415" height="32" fill="rgba(225, 29, 72, 0.08)" />
              <line
                x1="30"
                y1="128"
                x2="445"
                y2="128"
                stroke="#737373"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="36" y="142" fill="#a3a3a3" fontSize="9" fontFamily="JetBrains Mono, monospace">
                SAFETY STOCK BUFFER (165 u)
              </text>

              {/* Reorder Point (ROP) Laser Threshold Line */}
              <line
                x1="30"
                y1="88"
                x2="445"
                y2="88"
                stroke="#f43f5e"
                strokeDasharray="5 4"
                strokeWidth="1.5"
              />
              <text x="36" y="81" fill="#fda4af" fontSize="9" fontFamily="JetBrains Mono, monospace">
                REORDER POINT THRESHOLD (ROP = 665 u)
              </text>

              {/* Sawtooth Inventory Curve */}
              <path
                d="M 30 32 L 125 92 L 155 122 L 155 30 L 265 88 L 300 118 L 300 28 L 410 96 L 440 116"
                fill="none"
                stroke="#f5f5f5"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />

              {/* Replenishment Vertical Arrows (+EOQ) */}
              <circle cx="125" cy="92" r="4" fill="#f43f5e" />
              <circle cx="265" cy="88" r="4" fill="#f43f5e" />
              <circle cx="410" cy="96" r="4.5" fill="#f43f5e" />

              <rect x="135" y="36" width="58" height="18" rx="4" fill="#171717" stroke="#404040" />
              <text x="142" y="48" fill="#86efac" fontSize="9" fontFamily="JetBrains Mono, monospace">
                +350 EOQ
              </text>

              <rect x="275" y="34" width="58" height="18" rx="4" fill="#171717" stroke="#404040" />
              <text x="282" y="46" fill="#86efac" fontSize="9" fontFamily="JetBrains Mono, monospace">
                +350 EOQ
              </text>
            </svg>
          </div>

          {/* SLIDE 2 VISUAL: Anomaly Detection & Baseline Protection */}
          <div className="w-full shrink-0 p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a3a3] border-b border-[#1f1f1f] pb-2.5">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Modified Z-Score Cleaning (Days 1–120)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                2 Outliers Intercepted
              </span>
            </div>

            <svg viewBox="0 0 460 185" className="w-full h-44 block overflow-visible">
              <line x1="25" y1="35" x2="445" y2="35" stroke="#1f1f1f" strokeWidth="1" />
              <line x1="25" y1="95" x2="445" y2="95" stroke="#262626" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="25" y1="150" x2="445" y2="150" stroke="#1f1f1f" strokeWidth="1" />

              {/* Shaded Holdout Window */}
              <rect x="355" y="20" width="90" height="140" fill="rgba(255,255,255,0.04)" rx="4" />
              <text x="364" y="34" fill="#a3a3a3" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                30d HOLDOUT
              </text>

              {/* Raw Spike Ghost Line */}
              <path
                d="M 185 95 L 200 22 L 215 93"
                fill="none"
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle cx="200" cy="22" r="5" fill="#f43f5e" />
              <rect x="210" y="12" width="128" height="20" rx="4" fill="#2a0a12" stroke="#f43f5e" />
              <text x="217" y="25" fill="#fda4af" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                1000u Digit Slip → Imputed 50u
              </text>

              {/* Clean Demand Series */}
              <path
                d="M 25 98 L 55 90 L 85 102 L 115 92 L 145 96 L 185 95 L 200 94 L 215 93 L 250 89 L 285 97 L 320 91 L 355 95 L 385 88 L 415 94 L 445 90"
                fill="none"
                stroke="#f5f5f5"
                strokeWidth="2.2"
              />
              <text x="32" y="116" fill="#86efac" fontSize="9" fontFamily="JetBrains Mono, monospace">
                Clean Training Median = 50 u/day (Uncorrupted σ_d)
              </text>
            </svg>
          </div>

          {/* SLIDE 3 VISUAL: Dual-Variance & Monte Carlo Risk Distribution */}
          <div className="w-full shrink-0 p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#a3a3a3] border-b border-[#1f1f1f] pb-2.5">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Scenario Stress Test (+30% Surge, +3d Delay)
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                10,000 Trials · mulberry32
              </span>
            </div>

            <svg viewBox="0 0 460 185" className="w-full h-44 block overflow-visible">
              <line x1="25" y1="155" x2="445" y2="155" stroke="#262626" strokeWidth="1" />

              {/* Baseline Bell Curve */}
              <path
                d="M 40 155 Q 115 150 155 85 T 230 155"
                fill="rgba(255,255,255,0.06)"
                stroke="#a3a3a3"
                strokeWidth="1.5"
              />
              <text x="95" y="65" fill="#a3a3a3" fontSize="9" fontFamily="JetBrains Mono, monospace">
                Baseline Demand (5.0% Risk)
              </text>

              {/* Stressed Scenario Bell Curve */}
              <path
                d="M 140 155 Q 235 148 285 45 T 425 155"
                fill="rgba(244, 63, 94, 0.14)"
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <text x="245" y="32" fill="#fda4af" fontSize="9" fontFamily="JetBrains Mono, monospace">
                Surge + Delay Distribution
              </text>

              {/* Old ROP Cutoff Line */}
              <line
                x1="250"
                y1="25"
                x2="250"
                y2="160"
                stroke="#f5f5f5"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
              <text x="256" y="142" fill="#f5f5f5" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                New ROP → Restores 95% SL
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Slide Caption, Metrics & Sliding Controls */}
      <div className="relative z-10 space-y-5">
        <div className="space-y-2 min-h-[84px] transition-all duration-300">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3]">
            {SLIDES[activeSlide].tag}
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-white leading-snug">
            {SLIDES[activeSlide].title}
          </h2>
          <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-md">
            {SLIDES[activeSlide].subtitle}
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#222222]">
          {SLIDES[activeSlide].metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg bg-[#161616] border border-[#262626] px-3 py-2 font-mono"
            >
              <div className="text-[10px] text-[#737373] truncate">{m.label}</div>
              <div className="text-xs font-semibold text-[#f5f5f5] mt-0.5 truncate">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators & Navigation Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? "w-8 bg-white" : "w-2 bg-[#404040] hover:bg-[#737373]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="p-1.5 rounded-md border border-[#262626] bg-[#161616] text-[#a3a3a3] hover:text-white hover:border-[#404040] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="p-1.5 rounded-md border border-[#262626] bg-[#161616] text-[#a3a3a3] hover:text-white hover:border-[#404040] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
