// apps/web/src/components/dashboard/MethodologyView.tsx
// Screen 6: Mathematical Methodology & Formula Reference adhering to ThoughtStream design system

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
          Mathematical Foundation · Transparency Whitepaper
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
          Inventory Mathematics &amp; Methodology
        </h1>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 font-sans leading-relaxed">
          StockSense implements pure mathematical optimization with zero hidden heuristics. All safety stock, reorder point, and lot size calculations execute inside the isolated <code className="font-mono text-xs bg-[#F5F5F4] dark:bg-[#1C1917] px-1 py-0.5">@stocksense/core</code> engine.
        </p>
      </div>

      {/* Core Architectural Rule */}
      <Card variant="elevated" className="border-l-4 border-l-[#1C1917] dark:border-l-[#FAFAF9]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#1C1917] dark:text-[#FAFAF9] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FAFAF9]">
                Core Mantra: Rules Decide, AI Advises
              </h2>
              <p className="text-[13px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                Large Language Models produce narrative insights, root-cause hypotheses, and scenario interpretations. Under no circumstances do LLMs compute numbers, alter inventory thresholds directly, or trigger purchase orders without human verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents Anchors */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-[#E7E5E4] dark:border-[#292524] pb-4">
        {[
          { id: "safety-stock", label: "Safety Stock" },
          { id: "reorder-point", label: "Reorder Point" },
          { id: "service-level", label: "Service Level & z" },
          { id: "eoq", label: "EOQ & Costs" },
          { id: "simulation", label: "Monte Carlo" },
          { id: "anomalies", label: "Anomalies" },
          { id: "forecast", label: "Forecast Models" },
          { id: "holdout", label: "Holdout Check" },
          { id: "ai", label: "AI Boundaries" },
          { id: "limits", label: "Limitations" },
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="px-2.5 py-1 text-xs font-mono bg-white dark:bg-[#1C1917] border border-[#E7E5E4] dark:border-[#292524] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
          >
            #{item.label}
          </a>
        ))}
      </div>

      {/* Section 1: Dual-Variance Safety Stock */}
      <section id="safety-stock" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          1. Dual-Variance Safety Stock Derivation
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          Standard textbook inventory formulas assume lead time is completely fixed (L = const). In real-world primary healthcare and retail supply chains, lead time itself is stochastic with significant standard deviation (&sigma;_L &gt; 0). We model lead-time demand using the complete dual-variance expansion:
        </p>

        <Card variant="default">
          <CardContent className="p-6 font-mono text-sm space-y-3 bg-[#F5F5F4] dark:bg-[#1C1917]/50">
            <div className="text-base font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              SS = z · σ_LT
            </div>
            <div className="text-[#57534E] dark:text-[#D6D3D1] text-xs">
              Where lead-time variance is given by:
            </div>
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-sm font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              σ_LT = √( L̄ · σ_d² + d̄² · σ_L² )
            </div>
            <div className="text-xs text-[#78716C] dark:text-[#A8A29E] space-y-1 pt-2">
              <div>· <strong>L̄:</strong> Mean lead time (converted strictly to days)</div>
              <div>· <strong>σ_d:</strong> Standard deviation of daily demand over training window</div>
              <div>· <strong>d̄:</strong> Mean daily demand</div>
              <div>· <strong>σ_L:</strong> Standard deviation of supplier lead time (days)</div>
              <div>· <strong>z:</strong> Standard normal inverse CDF corresponding to target Cycle Service Level</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Reorder Point (ROP) */}
      <section id="reorder-point" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          2. Reorder Point (ROP)
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          The reorder point triggers replenishment whenever stock-on-hand drops to or below the calculated threshold. Quantities are ceiling-rounded to prevent under-buffering fractional units.
        </p>

        <Card variant="default">
          <CardContent className="p-6 font-mono text-sm space-y-3 bg-[#F5F5F4] dark:bg-[#1C1917]/50">
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-sm font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              ROP = ⌈ d̄ · L̄ + SS ⌉
            </div>
            <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              Condition: An emergency order is flagged immediately when <code>currentStock ≤ ROP</code>.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Cycle Service Level & Z Factor Table */}
      <section id="service-level" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          3. Cycle Service Level &amp; Z-Table Values
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          Cycle service level denotes the probability that aggregate demand during replenishment lead time does not exceed available stock. We compute z factor quantiles using rational Chebyshev normal CDF approximations:
        </p>

        <Card variant="default">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle Service Level (CSL)</TableHead>
                  <TableHead className="font-mono text-right">Standard Normal Factor (z)</TableHead>
                  <TableHead className="font-mono text-right">Expected Stockout Rate</TableHead>
                  <TableHead>Clinical / Operational Guidance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { csl: "80.0%", z: "0.842", rate: "20.0%", guide: "Non-critical consumables, fast-moving supplies" },
                  { csl: "90.0%", z: "1.282", rate: "10.0%", guide: "Standard retail merchandise" },
                  { csl: "95.0%", z: "1.645", rate: "5.0%", guide: "Essential generic medicines (Default baseline)" },
                  { csl: "97.5%", z: "1.960", rate: "2.5%", guide: "Hospital emergency supplies" },
                  { csl: "99.0%", z: "2.326", rate: "1.0%", guide: "Life-saving therapeutics, insulin, vaccines" },
                  { csl: "99.9%", z: "3.090", rate: "0.1%", guide: "Critical intensive care antidotes" },
                ].map((row) => (
                  <TableRow key={row.csl}>
                    <TableCell className="font-bold font-mono text-xs">{row.csl}</TableCell>
                    <TableCell className="font-mono text-right text-xs">{row.z}</TableCell>
                    <TableCell className="font-mono text-right text-xs text-[#78716C] dark:text-[#A8A29E]">{row.rate}</TableCell>
                    <TableCell className="text-xs text-[#57534E] dark:text-[#D6D3D1]">{row.guide}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Economic Order Quantity (EOQ) */}
      <section id="eoq" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          4. Economic Order Quantity (EOQ) &amp; Total Cost
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          The classic Wilson lot-sizing formula minimizes the sum of fixed order placement overhead and working capital holding fees:
        </p>

        <Card variant="default">
          <CardContent className="p-6 font-mono text-sm space-y-3 bg-[#F5F5F4] dark:bg-[#1C1917]/50">
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-sm font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              EOQ = ⌈ √( (2 · D · S) / H ) ⌉
            </div>
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-xs text-[#57534E] dark:text-[#D6D3D1]">
              Total Annual Cost = (D / Q) · S + (Q / 2) · H + (SS) · H
            </div>
            <div className="text-xs text-[#78716C] dark:text-[#A8A29E] space-y-1 pt-2">
              <div>· <strong>D:</strong> Annual demand (365 × meanDailyDemand)</div>
              <div>· <strong>S:</strong> Fixed cost incurred per purchase order (₹)</div>
              <div>· <strong>H:</strong> Annual holding cost per unit (₹ = unitCost × holdingRate)</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 5: Monte Carlo Simulation */}
      <section id="simulation" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          5. Deterministic Monte Carlo Verification
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          To corroborate theoretical normal CDF stockout risks, StockSense runs 10,000 Monte Carlo trials per scenario. Determinism is strictly maintained by using the 32-bit Mulberry32 seeded pseudo-random number generator (PRNG) with Box-Muller Gaussian transforms.
        </p>

        <Card variant="flat">
          <CardContent className="p-4 flex items-center justify-between text-xs font-mono text-[#57534E] dark:text-[#A8A29E]">
            <span>Deterministic Seed: <code>20261011</code></span>
            <span>Trials: <code>10,000</code></span>
            <span>Engine: <code>@stocksense/core/simulate.ts</code></span>
          </CardContent>
        </Card>
      </section>

      {/* Section 6: Anomalies Detection */}
      <section id="anomalies" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          6. Anomaly Detection &amp; Treatment
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          Anomalies are detected using Boris Iglewicz and David Hoaglin's modified z-score test based on the median and Median Absolute Deviation (MAD):
        </p>
        <Card variant="default">
          <CardContent className="p-6 font-mono text-sm space-y-3 bg-[#F5F5F4] dark:bg-[#1C1917]/50">
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-sm font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              M_i = 0.6745 · (x_i - x̃) / MAD
            </div>
            <p className="text-xs text-[#57534E] dark:text-[#D6D3D1]">
              Observations with |M_i| &gt; 3.5 are flagged as potential outliers. Classes (Promotion, Stockout, Data Error, Unknown) receive specific mathematical treatments without silent deletion.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Section 7: Forecast Models */}
      <section id="forecast" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          7. Forecast Architectures &amp; Selection
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          StockSense compares a Seasonal Day-of-Week multiplicative smoothing model against a 7-day rolling moving average baseline. The champion is selected strictly by minimizing out-of-sample WAPE:
        </p>
        <Card variant="default">
          <CardContent className="p-6 font-mono text-sm space-y-3 bg-[#F5F5F4] dark:bg-[#1C1917]/50">
            <div className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-sm font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              WAPE = ( ∑ |actual_t - forecast_t| ) / ( ∑ actual_t )
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 8: Holdout Validation */}
      <section id="holdout" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          8. Holdout Window &amp; Leakage Prevention
        </h2>
        <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] leading-relaxed font-sans">
          The dataset is split chronologically into an 80% training window and a 20% holdout window (minimum 14 days required). All medians, seasonal indices, and baseline estimators are computed exclusively on the training window.
        </p>
      </section>

      {/* Section 9: AI Capabilities & Boundaries */}
      <section id="ai" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          9. AI Boundaries: What AI Can and Cannot Do
        </h2>
        <Card variant="flat">
          <CardContent className="p-6 space-y-3 text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            <p><strong>What AI CAN do:</strong> Synthesize contextual explanations, parse unstructured natural-language scenario prompts into bounded parameters, and suggest plausible hypotheses for demand spikes.</p>
            <p><strong>What AI CANNOT do:</strong> Compute safety stocks, override reorder points directly, or alter core math parameters without deterministic validation and explicit human confirmation.</p>
          </CardContent>
        </Card>
      </section>

      {/* Section 10: Limitations & Assumptions */}
      <section id="limits" className="space-y-4 scroll-mt-20">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
          10. Assumptions &amp; Operational Limitations
        </h2>
        <Card variant="default">
          <CardContent className="p-6 space-y-2 text-xs leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            <p>· <strong>Stationarity:</strong> Lead-time demand variance assumes underlying normal approximations during replenishment cycles.</p>
            <p>· <strong>Fill Rate vs Cycle Service Level:</strong> Cycle Service Level (CSL) guarantees the probability of zero stockouts per cycle, whereas Fill Rate measures the fraction of demand met directly from stock.</p>
            <p>· <strong>Decision Support Only:</strong> StockSense is an advisory intelligence platform. Physical orders must always be reviewed by authorized clinical storekeepers.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
