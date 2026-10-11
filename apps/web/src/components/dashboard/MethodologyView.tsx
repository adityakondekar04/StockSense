// apps/web/src/components/dashboard/MethodologyView.tsx
// Screen 6: Methodology & Formula Transparency (Pure mathematical formulation)

import React from "react";
import {
  BookOpen,
  Calculator,
  ShieldAlert,
  Info,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">StockSense Specification</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mt-1">Mathematical Methodology & Ground Rules</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Zero black-box calculations. Every number produced by StockSense traces directly to established inventory theory, deterministic formulas in <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">packages/core</code>, and rigorous data boundaries.
        </p>

        {/* Quick Anchor Navigation */}
        <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100 text-xs font-semibold">
          <a href="#safety-stock" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#safety-stock</a>
          <a href="#reorder-point" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#reorder-point</a>
          <a href="#eoq" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#eoq</a>
          <a href="#service-level" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#service-level</a>
          <a href="#anomalies" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#anomalies</a>
          <a href="#forecast" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#forecast</a>
          <a href="#simulation" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#simulation</a>
          <a href="#ai" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#ai-guardrails</a>
          <a href="#limits" className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2.5 py-1 rounded-lg text-slate-700 transition-colors">#limits</a>
        </div>
      </div>

      {/* 2. Section: Safety Stock */}
      <section id="safety-stock" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">1. Safety Stock (SS) with Dual Variability</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Standard spreadsheet rules assume supplier lead times are completely constant. StockSense models both daily demand variability (<span className="font-mono">σD</span>) and supplier lead-time variability (<span className="font-mono">σL</span>) combined through the law of total variance:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm space-y-2 overflow-x-auto">
          <div className="text-indigo-400 font-semibold">// Total Lead-Time Standard Deviation (σLT)</div>
          <div>σ_LT = √( L̄ · σ_D² + D̄² · σ_L² )</div>
          <div className="text-indigo-400 font-semibold pt-2">// Safety Stock formula</div>
          <div>SS = z · σ_LT</div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <div>• <strong className="font-mono">D̄, σ_D</strong>: Empirical mean and standard deviation of daily sales over the training history.</div>
          <div>• <strong className="font-mono">L̄, σ_L</strong>: Mean and standard deviation of supplier fulfillment lead time (in days).</div>
          <div>• <strong className="font-mono">z</strong>: Normal inverse cumulative distribution factor corresponding to the selected cycle service level.</div>
        </div>
      </section>

      {/* 3. Section: Reorder Point */}
      <section id="reorder-point" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">2. Reorder Point (ROP) Policy</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          StockSense operates a continuous review <span className="font-semibold">(s, Q)</span> policy on <strong>Inventory Position</strong> (<span className="font-mono">IP = On-Hand + On-Order - Backorders</span>). When inventory position falls below ROP, an alert triggers:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm space-y-2 overflow-x-auto">
          <div>ROP = ⌈ D̄ · L̄ + SS ⌉</div>
          <div className="text-slate-400 text-xs">// Rounded up to the nearest integer unit</div>
        </div>
      </section>

      {/* 4. Section: EOQ & Pack Size */}
      <section id="eoq" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">3. Economic Order Quantity (EOQ) & Constraints</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Determines the cost-optimal order quantity balancing fixed ordering cost per replenishment against annual inventory holding cost:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm space-y-2 overflow-x-auto">
          <div>EOQ = √( (2 · D_annual · S) / H )</div>
          <div>Q = max( MOQ, ⌈ EOQ / PackSize ⌉ · PackSize )</div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <div>• <strong className="font-mono">D_annual</strong>: Annualized demand (<span className="font-mono">D̄ · 365</span>).</div>
          <div>• <strong className="font-mono">S</strong>: Fixed order cost per purchase order.</div>
          <div>• <strong className="font-mono">H</strong>: Annual holding cost per unit (<span className="font-mono">holdingRate · unitCost</span>).</div>
        </div>
      </section>

      {/* 5. Section: Service Level & z-Factor */}
      <section id="service-level" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">4. Target Service Level & z-Factor Calibration</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Every recommendation in StockSense displays the service level and its exact z-factor. Cycle service level is the probability of zero stockouts during a replenishment cycle:
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold border-b border-slate-200 text-slate-700">
              <tr>
                <th className="p-3">Target Service Level</th>
                <th className="p-3">Exact z-Factor</th>
                <th className="p-3">Cycle Stockout Probability</th>
                <th className="p-3">Recommended Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="p-3 font-semibold">80.0%</td><td className="p-3 font-mono font-bold text-indigo-600">0.842</td><td className="p-3">20.0%</td><td className="p-3 text-slate-500">Low-criticality FMCG items</td></tr>
              <tr><td className="p-3 font-semibold">90.0%</td><td className="p-3 font-mono font-bold text-indigo-600">1.282</td><td className="p-3">10.0%</td><td className="p-3 text-slate-500">Standard general retail</td></tr>
              <tr className="bg-indigo-50/50"><td className="p-3 font-bold text-indigo-900">95.0% (Default)</td><td className="p-3 font-mono font-black text-indigo-700">1.645</td><td className="p-3 font-semibold text-indigo-900">5.0%</td><td className="p-3 text-slate-700 font-medium">Core essential medicines (e.g. Paracetamol, ORS)</td></tr>
              <tr><td className="p-3 font-semibold">97.5%</td><td className="p-3 font-mono font-bold text-indigo-600">1.960</td><td className="p-3">2.5%</td><td className="p-3 text-slate-500">Chronic maintenance treatments</td></tr>
              <tr><td className="p-3 font-semibold">99.0%</td><td className="p-3 font-mono font-bold text-indigo-600">2.326</td><td className="p-3">1.0%</td><td className="p-3 text-slate-500">Critical acute therapies</td></tr>
              <tr><td className="p-3 font-semibold">99.9%</td><td className="p-3 font-mono font-bold text-indigo-600">3.090</td><td className="p-3">0.1%</td><td className="p-3 text-slate-500">Vital emergency life-saving antidotes</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Section: Anomaly Detection */}
      <section id="anomalies" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">5. Anomaly Detection & Handling Matrix</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Unusual demand values are flagged via Modified Z-Scores after subtracting weekday median baselines. Anomalies are classified into three distinct categories and handled transparently:
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold border-b border-slate-200 text-slate-700">
              <tr>
                <th className="p-3">Classification</th>
                <th className="p-3">Detection Rule</th>
                <th className="p-3">Baseline Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-bold text-red-700">DATA_ERROR</td>
                <td className="p-3">Negative value (&lt;0) or extreme digit slip (&gt;10x median)</td>
                <td className="p-3">Excluded from variance; imputed from weekday median.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">PROMOTION</td>
                <td className="p-3">Recorded in promo calendar or 3-day multi-day consecutive surge</td>
                <td className="p-3">Removed from regular baseline; stored as reusable uplift factor.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700">UNKNOWN</td>
                <td className="p-3">Isolated spike with modified z-score &gt; 3.5</td>
                <td className="p-3">Kept with warning; recommendation displayed with and without.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Section: Monte Carlo Simulation */}
      <section id="simulation" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">6. Seeded Monte Carlo Simulation</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Analytic formulas rely on normal approximations. In the Scenario Lab, StockSense cross-validates analytic results with 10,000 independent simulated replenishment cycles using a deterministic PRNG (<span className="font-mono">mulberry32</span>) and the Box-Muller transform:
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5 text-slate-700">
          <div>• <strong>Deterministic reproducibility:</strong> The same scenario inputs and PRNG seed always yield identical outputs.</div>
          <div>• <strong>Lead-time duration drawing:</strong> Each simulated cycle samples an integer delivery duration from Gaussian <span className="font-mono">N(L̄, σ_L)</span>.</div>
          <div>• <strong>Cycle demand accumulation:</strong> Daily demands are independently drawn from <span className="font-mono">N(D̄, σ_D)</span> across the lead-time window.</div>
        </div>
      </section>

      {/* 8. Section: AI Guardrails */}
      <section id="ai" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">7. Bounded AI Architecture & Guardrails</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The core rule of StockSense is: <strong>"Rules Decide, AI Advises."</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Strict Clamp (±30% Cap)</span>
            <p className="text-slate-600">
              Any LLM proposal attempting to adjust baseline demand by more than ±30% is automatically clamped by Zod middleware before display.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Offline Deterministic Fallback</span>
            <p className="text-slate-600">
              If the LLM provider fails, times out (&gt;5s), or is toggled off, StockSense automatically falls back to deterministic rules with zero user disruption.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Section: Scope & Limitations */}
      <section id="limits" className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Honest Scope & Model Assumptions</span>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Single Echelon:</strong> StockSense optimizes single retail pharmacies and store rooms, not multi-tier warehouse networks.</li>
          <li><strong>Continuous Review:</strong> Assumes inventory is tracked after each dispense, triggering reorders whenever position drops to ROP.</li>
          <li><strong>Lost Sales:</strong> Unmet demand during stockouts is treated as lost demand rather than accumulating as backorders.</li>
          <li><strong>Fictional Demo Data:</strong> All demo catalog data is generated synthetically for algorithmic demonstration.</li>
        </ul>
      </section>
    </div>
  );
};
