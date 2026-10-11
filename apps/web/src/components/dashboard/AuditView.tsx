// apps/web/src/components/dashboard/AuditView.tsx
// Screen 7: Decision Log & Audit Trail adhering to ThoughtStream design system

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge, FilterChip } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { EmptyState } from "../ui/empty-state";

export const AuditView: React.FC = () => {
  const { auditLog } = useInventory();

  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLog.filter((item) => {
      const skuText = item.sku ?? "";
      const matchesSearch =
        skuText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kind.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "ALL" ||
        (filterType === "AI" && item.decisionPath === "LLM") ||
        (filterType === "RULES" && item.decisionPath === "RULES") ||
        (filterType === "OVERRIDE" && item.kind === "override");

      return matchesSearch && matchesType;
    });
  }, [auditLog, searchQuery, filterType]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Timestamp", "SKU", "Kind", "DecisionPath", "Summary"];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.at,
      log.sku ?? "N/A",
      log.kind,
      log.decisionPath,
      `"${log.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("link") as any;
    link.href = url;
    link.setAttribute("download", `stocksense_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Governance &amp; Audit Trail · Step 7
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Decision Log &amp; Audit Trail
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Immutable, append-only operational event ledger. Records every recommendation generation, formula parameter recalculation, manual storekeeper override, and AI prompt invocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="font-mono text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Audit CSV
          </Button>
          <Link to="/methodology">
            <Button variant="primary" size="sm" className="font-mono text-xs">
              View Methodology <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="default">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search audit trail by SKU or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase mr-1">
              Filter:
            </span>
            <FilterChip
              selected={filterType === "ALL"}
              onClick={() => setFilterType("ALL")}
            >
              All Events ({auditLog.length})
            </FilterChip>
            <FilterChip
              selected={filterType === "RULES"}
              onClick={() => setFilterType("RULES")}
            >
              Rules
            </FilterChip>
            <FilterChip
              selected={filterType === "AI"}
              onClick={() => setFilterType("AI")}
            >
              AI Advisory
            </FilterChip>
            <FilterChip
              selected={filterType === "OVERRIDE"}
              onClick={() => setFilterType("OVERRIDE")}
            >
              Overrides
            </FilterChip>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      {auditLog.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          description="Every calculation, anomaly classification, AI recommendation, and manual override is recorded here in an immutable audit ledger."
          action={{
            label: "Go to Recommendations",
            to: "/recommendations",
          }}
        />
      ) : (
        <Card variant="default">
          <CardHeader>
            <CardTitle>Immutable Event Ledger</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} verified operations. Click any row to expand the technical telemetry payload.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Event Category</TableHead>
                  <TableHead>Decision Path</TableHead>
                  <TableHead>Summary Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-[#A8A29E]">
                      No audit records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const isAi = log.decisionPath === "LLM";
                  const isFallback = log.decisionPath === "LLM_FAILED_RULES";

                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        onClick={() => toggleExpand(log.id)}
                        className="cursor-pointer hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]/70"
                      >
                        <TableCell className="w-10 text-center text-[#78716C]">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 mx-auto" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap text-[#57534E] dark:text-[#A8A29E]">
                          {log.at}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-xs text-[#1C1917] dark:text-[#FAFAF9]">
                          {log.sku ?? "GLOBAL"}
                        </TableCell>
                        <TableCell className="font-mono text-xs uppercase text-[#57534E] dark:text-[#A8A29E]">
                          {log.kind}
                        </TableCell>
                        <TableCell>
                          {isAi && (
                            <Badge variant="primary" size="sm">
                              <Sparkles className="w-3 h-3 mr-0.5" /> LLM Advisory
                            </Badge>
                          )}
                          {isFallback && (
                            <Badge variant="warning" size="sm">
                              LLM Fallback (Rules)
                            </Badge>
                          )}
                          {!isAi && !isFallback && (
                            <Badge variant="neutral" size="sm">
                              <ShieldCheck className="w-3 h-3 mr-0.5" /> Deterministic
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#57534E] dark:text-[#D6D3D1] max-w-md truncate">
                          {log.summary}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-[#F5F5F4]/70 dark:bg-[#1C1917]/90">
                          <TableCell colSpan={6} className="p-4">
                            <div className="space-y-2 font-mono text-xs">
                              <div className="flex items-center justify-between text-[#78716C] dark:text-[#A8A29E] border-b border-[#E7E5E4] dark:border-[#292524] pb-2">
                                <span>Event UUID: {log.id}</span>
                                <span>Kind: {log.kind} · Decision Path: {log.decisionPath}</span>
                              </div>
                              <pre className="p-3 bg-white dark:bg-[#0C0A09] border border-[#E7E5E4] dark:border-[#292524] text-[#1C1917] dark:text-[#FAFAF9] overflow-x-auto text-[11px] leading-relaxed">
                                {JSON.stringify(
                                  {
                                    id: log.id,
                                    at: log.at,
                                    sku: log.sku,
                                    kind: log.kind,
                                    decisionPath: log.decisionPath,
                                    summary: log.summary,
                                    details: log.details,
                                    engine: "@stocksense/core",
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
