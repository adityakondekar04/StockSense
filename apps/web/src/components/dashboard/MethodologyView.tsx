// apps/web/src/components/dashboard/MethodologyView.tsx
// Screen 6: Methodology & Formulas matching the Landing Page minimalist theme

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
          SYSTEM · MATHEMATICAL REFERENCE
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
          Methodology
        </h1>
        <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 leading-relaxed">
          All safety stock, reorder point, and order quantity formulas run deterministically in{" "}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#1f1f1f] border border-[#ebebeb] dark:border-[#262626]">
            @stocksense/core
          </code>
          .
        </p>
      </div>

      {/* Core Rule Banner */}
      <Card variant="default">
        <CardContent className="p-5 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
              Rules Decide, AI Advises
            </h2>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
              AI suggestions are validated with Zod, clamped to safe bounds, and logged in the
              Decision Log. AI never directly calculates safety stock, reorder points, or order
              quantities.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 1. Safety Stock */}
      <section id="safety-stock" className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-[#171717] dark:text-[#f5f5f5]">
          1. Safety Stock (Dual-Variance)
        </h2>
        <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] leading-relaxed">
          Protects against both daily demand fluctuations and supplier lead-time variability:
        </p>
        <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-4 font-mono text-xs space-y-2">
          <div className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
            SS = z · √( L̄ · σ_d² + d̄² · σ_L² )
          </div>
          <div className="text-[#737373] dark:text-[#a3a3a3] space-y-1 pt-1">
            <div>· L̄ = Mean supplier lead time (days)</div>
            <div>· σ_L = Lead time standard deviation (days)</div>
            <div>· d̄ = Mean daily demand (units/day)</div>
            <div>· σ_d = Daily demand standard deviation (units/day)</div>
          </div>
        </div>
      </section>

      {/* 2. Reorder Point & EOQ */}
      <section id="reorder-point" className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-[#171717] dark:text-[#f5f5f5]">
          2. Reorder Point &amp; Order Quantity (EOQ)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-4 space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
              Reorder Point
            </div>
            <div className="font-mono text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
              ROP = ⌈ d̄ · L̄ + SS ⌉
            </div>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">
              Triggers `Order now` when inventory position ≤ ROP.
            </p>
          </div>

          <div id="eoq" className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-4 space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
              Economic Order Quantity
            </div>
            <div className="font-mono text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
              EOQ = ⌈ √( (2 · D · S) / H ) ⌉
            </div>
            <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">
              Balances annual ordering cost (S) and holding cost (H).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Service Level & z-factor */}
      <section id="service-level" className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-[#171717] dark:text-[#f5f5f5]">
          3. Cycle Service Level &amp; z-Factor
        </h2>
        <Card variant="default" className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Level</TableHead>
                <TableHead className="text-right">z-Factor</TableHead>
                <TableHead className="text-right">Cycle Stockout Risk</TableHead>
                <TableHead>Typical Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { csl: "80.0%", z: "0.842", rate: "20.0%", guide: "Non-critical retail items" },
                { csl: "90.0%", z: "1.282", rate: "10.0%", guide: "Standard merchandise" },
                { csl: "95.0%", z: "1.645", rate: "5.0%", guide: "Essential medicines (Default)" },
                { csl: "97.5%", z: "1.960", rate: "2.5%", guide: "High-priority clinical stock" },
                { csl: "99.0%", z: "2.326", rate: "1.0%", guide: "Critical therapeutics & insulin" },
                { csl: "99.9%", z: "3.090", rate: "0.1%", guide: "Emergency life-saving supplies" },
              ].map((row) => (
                <TableRow key={row.csl}>
                  <TableCell className="font-mono font-semibold text-xs">{row.csl}</TableCell>
                  <TableCell className="font-mono text-right text-xs">{row.z}</TableCell>
                  <TableCell className="font-mono text-right text-xs text-[#737373] dark:text-[#a3a3a3]">
                    {row.rate}
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    {row.guide}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
};
