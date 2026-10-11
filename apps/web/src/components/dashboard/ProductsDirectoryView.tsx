// apps/web/src/components/dashboard/ProductsDirectoryView.tsx
// Dedicated Products Directory page with comprehensive catalog table and quick actions

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  BarChart3,
  LineChart,
  Sliders,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy, type ProductRecord } from "../../data/inventoryData";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge, FilterChip } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

function getProductCategory(sku: string): string {
  if (sku.startsWith("ORS")) return "Electrolytes";
  if (sku.startsWith("PCM")) return "Analgesics";
  if (sku.startsWith("INS")) return "Endocrine";
  if (sku.startsWith("FLU")) return "Antivirals";
  if (sku.startsWith("BND")) return "Surgical";
  if (sku.startsWith("ANT")) return "Antibiotics";
  return "General";
}

export const ProductsDirectoryView: React.FC = () => {
  const {
    products,
    serviceLevel,
    includeUnknowns,
    setSelectedProductId,
  } = useInventory();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ORDER_NOW" | "OK">("ALL");
  const [sortField, setSortField] = useState<"sku" | "name" | "stock" | "rop" | "daysCover">("sku");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Compute calculated policies for all products
  const productRows = useMemo(() => {
    return products.map((prod) => {
      const isUnknownIncluded = includeUnknowns[prod.sku] ?? true;
      const policy = calculateProductPolicy(prod, serviceLevel, isUnknownIncluded);
      return {
        product: prod,
        category: getProductCategory(prod.sku),
        policy,
      };
    });
  }, [products, serviceLevel, includeUnknowns]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    productRows.forEach((p) => set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [productRows]);

  // Filter & sort
  const filteredRows = useMemo(() => {
    let result = [...productRows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.product.sku.toLowerCase().includes(q) ||
          r.product.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((r) => r.category === categoryFilter);
    }

    if (statusFilter === "ORDER_NOW") {
      result = result.filter((r) => r.policy.isOrderNow);
    } else if (statusFilter === "OK") {
      result = result.filter((r) => !r.policy.isOrderNow);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "sku") {
        comparison = a.product.sku.localeCompare(b.product.sku);
      } else if (sortField === "name") {
        comparison = a.product.name.localeCompare(b.product.name);
      } else if (sortField === "stock") {
        comparison = a.product.onHand - b.product.onHand;
      } else if (sortField === "rop") {
        comparison = a.policy.rec.ropOperational - b.policy.rec.ropOperational;
      } else if (sortField === "daysCover") {
        comparison = a.policy.daysCover - b.policy.daysCover;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [productRows, searchQuery, categoryFilter, statusFilter, sortField, sortDirection]);

  const toggleSort = (field: "sku" | "name" | "stock" | "rop" | "daysCover") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (product: ProductRecord) => {
    setSelectedProductId(product.id);
    navigate(`/products/${product.sku}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Inventory Catalog &amp; Master Index
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Products Directory
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Comprehensive registry of managed pharmaceutical SKUs. Monitor stock-on-hand against calculated reorder thresholds, lead-time variance, and replenishment urgency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/setup")}
            className="font-mono text-xs"
          >
            Manage Data &amp; CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/recommendations")}
            className="font-mono text-xs"
          >
            View Replenishment Cards
          </Button>
        </div>
      </div>

      {/* Control Strip: Search & Filter Chips */}
      <Card variant="default">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A8A29E]" />
              <Input
                placeholder="Search by SKU, product name, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-[12px] font-mono text-[#78716C] dark:text-[#A8A29E] mr-1">
                Status:
              </span>
              <FilterChip
                selected={statusFilter === "ALL"}
                onClick={() => setStatusFilter("ALL")}
              >
                All ({productRows.length})
              </FilterChip>
              <FilterChip
                selected={statusFilter === "ORDER_NOW"}
                onClick={() => setStatusFilter("ORDER_NOW")}
              >
                Order Now ({productRows.filter((r) => r.policy.isOrderNow).length})
              </FilterChip>
              <FilterChip
                selected={statusFilter === "OK"}
                onClick={() => setStatusFilter("OK")}
              >
                Healthy ({productRows.filter((r) => !r.policy.isOrderNow).length})
              </FilterChip>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E7E5E4] dark:border-[#292524]">
            <span className="text-[12px] font-mono text-[#78716C] dark:text-[#A8A29E] mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                selected={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
                className="text-xs py-1 px-3"
              >
                {cat}
              </FilterChip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card variant="default">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => toggleSort("sku")}
                  className="cursor-pointer hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SKU Code</span>
                    <ArrowUpDown className="w-3 h-3 text-[#A8A29E]" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product Name &amp; Category</span>
                    <ArrowUpDown className="w-3 h-3 text-[#A8A29E]" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("stock")}
                  className="text-right cursor-pointer hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Stock on Hand</span>
                    <ArrowUpDown className="w-3 h-3 text-[#A8A29E]" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("rop")}
                  className="text-right cursor-pointer hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Reorder Point (ROP)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#A8A29E]" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Safety Stock</TableHead>
                <TableHead
                  onClick={() => toggleSort("daysCover")}
                  className="text-right cursor-pointer hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Days Cover</span>
                    <ArrowUpDown className="w-3 h-3 text-[#A8A29E]" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Replenishment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#A8A29E]">
                    No matching products found. Try adjusting your search query or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(({ product, category, policy }) => (
                  <TableRow
                    key={product.sku}
                    className="cursor-pointer hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]/70 transition-colors"
                    onClick={() => handleRowClick(product)}
                  >
                    <TableCell className="font-mono font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#1C1917] dark:text-[#FAFAF9]">
                        {product.name}
                      </div>
                      <div className="text-[12px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                        {category} · Lead {product.leadTimeMean}d (±{product.leadTimeSd}d)
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#1C1917] dark:text-[#FAFAF9]">
                      {product.onHand.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-[#1C1917] dark:text-[#FAFAF9]">
                      {policy.rec.ropOperational.toLocaleString()} units
                    </TableCell>
                    <TableCell className="text-right font-mono text-[#78716C] dark:text-[#A8A29E]">
                      {Math.ceil(policy.rec.ss).toLocaleString()} units
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span
                        className={`font-semibold ${
                          policy.isOrderNow
                            ? "text-[#DC2626] dark:text-[#FCA5A5]"
                            : "text-[#1C1917] dark:text-[#FAFAF9]"
                        }`}
                      >
                        {policy.daysCover.toFixed(1)}d
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {policy.isOrderNow ? (
                        <Badge variant="error" size="sm">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Order Now
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Healthy
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/products/${product.sku}`}
                          className="p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#292524]"
                          title="Product Details"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/products/${product.sku}/cleaning`}
                          className="p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#292524]"
                          title="Data Cleaning"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/products/${product.sku}/forecast`}
                          className="p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#292524]"
                          title="Forecast Check"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/products/${product.sku}/scenario`}
                          className="p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#292524]"
                          title="Scenario Lab"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/report/${product.sku}`}
                          className="p-1.5 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#292524]"
                          title="Print 1-Page Report"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
