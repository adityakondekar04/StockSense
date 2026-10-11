// apps/web/src/components/dashboard/ProductsDirectoryView.tsx
// All Products catalog table matching the minimalist Landing Page theme

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
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge, FilterChip } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

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
    isLoading,
    loadDemoData,
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            INVENTORY CATALOG
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Complete SKU table comparing stock on hand against reorder points, safety stock, and days of cover.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate("/setup")}>
            Import Data
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/recommendations")}>
            View Recommendations
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#a3a3a3]" />
          <Input
            placeholder="Search by SKU, product, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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
            Order now ({productRows.filter((r) => r.policy.isOrderNow).length})
          </FilterChip>
          <FilterChip
            selected={statusFilter === "OK"}
            onClick={() => setStatusFilter("OK")}
          >
            Healthy ({productRows.filter((r) => !r.policy.isOrderNow).length})
          </FilterChip>

          <span className="mx-1 h-4 w-px bg-[#ebebeb] dark:bg-[#262626] hidden sm:inline-block" />

          {categories.map((cat) => (
            <FilterChip
              key={cat}
              selected={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <Card variant="default" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => toggleSort("sku")}
                className="cursor-pointer hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              >
                <div className="flex items-center gap-1">
                  <span>SKU</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => toggleSort("name")}
                className="cursor-pointer hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              >
                <div className="flex items-center gap-1">
                  <span>Product</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => toggleSort("stock")}
                className="text-right cursor-pointer hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>On Hand</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead
                onClick={() => toggleSort("rop")}
                className="text-right cursor-pointer hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Reorder Point</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Safety Stock</TableHead>
              <TableHead className="text-right">Order Qty</TableHead>
              <TableHead
                onClick={() => toggleSort("daysCover")}
                className="text-right cursor-pointer hover:text-[#171717] dark:hover:text-[#f5f5f5]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cover</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-8">
                    <EmptyState
                      title="Inventory Catalog is Empty"
                      description="No products exist in your catalog. Ingest sample clinical benchmark data or add products manually to start managing inventory replenishment."
                      action={{
                        label: "Load Demo Products",
                        onClick: () => loadDemoData(),
                      }}
                      secondaryAction={{
                        label: "Add Product Manually",
                        to: "/setup/manual",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-8">
                    <EmptyState
                      title="No Matching Products Found"
                      description="No catalog items matched your filter or search query. Try clearing filters or searching by a different SKU."
                      action={{
                        label: "Reset Search & Filters",
                        onClick: () => {
                          setSearchQuery("");
                          setCategoryFilter("ALL");
                          setStatusFilter("ALL");
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(({ product, category, policy }) => (
                <TableRow
                  key={product.sku}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(product)}
                >
                  <TableCell className="font-mono font-semibold text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[#171717] dark:text-[#f5f5f5]">
                      {product.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                      {category} · Lead {product.leadTimeMean}d (±{product.leadTimeSd}d)
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {product.onHand.toLocaleString()} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {policy.rec.ropOperational.toLocaleString()} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[#525252] dark:text-[#a3a3a3]">
                    {Math.ceil(policy.rec.ss).toLocaleString()} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {policy.rec.q.toLocaleString()} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {policy.daysCover.toFixed(1)}d
                  </TableCell>
                  <TableCell className="text-center">
                    {policy.isOrderNow ? (
                      <Badge variant="error" size="sm">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Order now</span>
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Healthy</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/products/${product.sku}/cleaning`}
                        onClick={() => setSelectedProductId(product.id)}
                        className="p-1.5 rounded text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f]"
                        title="Sales & Anomalies"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/products/${product.sku}/forecast`}
                        onClick={() => setSelectedProductId(product.id)}
                        className="p-1.5 rounded text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f]"
                        title="Demand Forecast"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/products/${product.sku}/scenario`}
                        onClick={() => setSelectedProductId(product.id)}
                        className="p-1.5 rounded text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f]"
                        title="Scenario Lab"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/report/${product.sku}`}
                        onClick={() => setSelectedProductId(product.id)}
                        className="p-1.5 rounded text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f]"
                        title="Print Report"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/products/${product.sku}`}
                        onClick={() => setSelectedProductId(product.id)}
                        className="p-1.5 rounded text-[#737373] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#f0f0f0] dark:hover:bg-[#1f1f1f]"
                        title="Product Details"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
