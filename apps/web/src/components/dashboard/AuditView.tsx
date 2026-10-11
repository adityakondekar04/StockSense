// apps/web/src/components/dashboard/AuditView.tsx
// Screen 7: Decision Log matching the Landing Page minimalist theme

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  Download,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Search,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge, FilterChip } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

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
        (filterType === "OVERRIDE" &&
          (item.kind === "override" || item.decisionPath === "CONFIRMED"));

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
      log.sku ?? "GLOBAL",
      log.kind,
      log.decisionPath,
      `"${log.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `stocksense_decision_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            SYSTEM · PROVENANCE
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Decision Log
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Every classification, scenario parse, and user override records whether it came from
            deterministic rules, AI suggestion, or user confirmation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Link to="/methodology">
            <Button variant="primary" size="sm">
              <span>Methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#a3a3a3]" />
          <Input
            placeholder="Search by SKU, type, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip selected={filterType === "ALL"} onClick={() => setFilterType("ALL")}>
            All ({auditLog.length})
          </FilterChip>
          <FilterChip selected={filterType === "RULES"} onClick={() => setFilterType("RULES")}>
            Rules
          </FilterChip>
          <FilterChip selected={filterType === "AI"} onClick={() => setFilterType("AI")}>
            AI suggestion
          </FilterChip>
          <FilterChip
            selected={filterType === "OVERRIDE"}
            onClick={() => setFilterType("OVERRIDE")}
          >
            Confirmed
          </FilterChip>
        </div>
      </div>

      {/* Decision Log Table */}
      <Card variant="default" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-9"></TableHead>
              <TableHead>Time</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-[#737373] dark:text-[#a3a3a3]">
                  No decisions match your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                const isAi = log.decisionPath === "LLM";
                const isFallback = log.decisionPath === "LLM_FAILED_RULES";
                const isConfirmed = log.decisionPath === "CONFIRMED";

                return (
                  <React.Fragment key={log.id}>
                    <TableRow
                      onClick={() => toggleExpand(log.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="w-9 text-center text-[#737373] dark:text-[#a3a3a3]">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 mx-auto" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap text-[#737373] dark:text-[#a3a3a3]">
                        {log.at.replace("T", " ").slice(0, 16)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-xs">
                        {log.sku ?? "GLOBAL"}
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase text-[#525252] dark:text-[#a3a3a3]">
                        {log.kind}
                      </TableCell>
                      <TableCell>
                        {isAi && (
                          <Badge variant="primary" size="sm">
                            <Sparkles className="w-3 h-3" />
                            <span>AI suggestion</span>
                          </Badge>
                        )}
                        {isFallback && (
                          <Badge variant="warning" size="sm">
                            <span>Rules used (AI unavailable)</span>
                          </Badge>
                        )}
                        {isConfirmed && (
                          <Badge variant="success" size="sm">
                            <span>Confirmed</span>
                          </Badge>
                        )}
                        {!isAi && !isFallback && !isConfirmed && (
                          <Badge variant="neutral" size="sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Rules</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3] max-w-md truncate">
                        {log.summary}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-[#fafafa] dark:bg-[#1a1a1a]">
                        <TableCell colSpan={6} className="p-4">
                          <pre className="rounded-md p-3 bg-white dark:bg-[#0a0a0a] border border-[#ebebeb] dark:border-[#262626] font-mono text-[11px] text-[#171717] dark:text-[#f5f5f5] overflow-x-auto leading-relaxed">
                            {JSON.stringify(
                              {
                                id: log.id,
                                at: log.at,
                                sku: log.sku,
                                kind: log.kind,
                                decisionPath: log.decisionPath,
                                summary: log.summary,
                                details: log.details,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
