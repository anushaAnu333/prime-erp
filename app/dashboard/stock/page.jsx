"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Link from "next/link";

export default function StockDashboard() {
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: "",
    lowStock: false,
    expired: false,
  });

  useEffect(() => {
    fetchStockData();
  }, [filters]);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.company) params.append("company", filters.company);
      if (filters.lowStock) params.append("lowStock", "true");
      if (filters.expired) params.append("expired", "true");

      const response = await fetch(`/api/stock?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data.stocks);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getStockStatusColor = (stock) => {
    if (stock.isExpired) return "text-red-600";
    if (stock.isLowStock) return "text-yellow-600";
    return "text-green-600";
  };

  const getStockStatusText = (stock) => {
    if (stock.isExpired) return "Expired";
    if (stock.isLowStock) return "Low Stock";
    return "Normal";
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (value) => (
        <span className="font-medium capitalize">{value}</span>
      ),
    },
    {
      key: "companyId",
      header: "Company",
      render: (value) => (
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "openingStock",
      header: "Opening Stock",
      render: (value, row) => (
        <span className="font-mono">{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "totalPurchases",
      header: "Purchases",
      render: (value, row) => (
        <span className="font-mono text-green-600">+{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "totalSales",
      header: "Sales",
      render: (value, row) => (
        <span className="font-mono text-red-600">-{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "closingStock",
      header: "Closing Stock",
      render: (value, row) => (
        <span className={`font-mono font-bold ${getStockStatusColor(row)}`}>
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockGiven",
      header: "Given to Agents",
      render: (value, row) => (
        <span className="font-mono">{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "stockDelivered",
      header: "Delivered",
      render: (value, row) => (
        <span className="font-mono text-blue-600">{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "salesReturns",
      header: "Returns",
      render: (value, row) => (
        <span className="font-mono text-orange-600">{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "stockAvailable",
      header: "Available",
      render: (value, row) => (
        <span className="font-mono font-bold">{formatNumber(value)} {row.unit}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isExpired 
            ? "bg-red-100 text-red-800" 
            : row.isLowStock 
            ? "bg-yellow-100 text-yellow-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {getStockStatusText(row)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/stock/${row._id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/stock/${row._id}/allocate`}>
            <Button size="sm" variant="outline">
              Allocate
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const companyOptions = [
    { value: "", label: "All Companies" },
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Foodtech" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Dashboard</h1>
        <p className="text-gray-600">
          Track inventory with the formula: Opening Stock + Purchases - Sales = Closing Stock
        </p>
      </div>

      {/* Stock Formula Display */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Formula</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(summary.totalOpeningStock || 0)}
            </div>
            <div className="text-sm text-gray-600">Opening Stock</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              + {formatNumber(summary.totalPurchases || 0)}
            </div>
            <div className="text-sm text-gray-600">Purchases</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              - {formatNumber(summary.totalSales || 0)}
            </div>
            <div className="text-sm text-gray-600">Sales</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">
              = {formatNumber(summary.totalClosingStock || 0)}
            </div>
            <div className="text-sm text-gray-600">Closing Stock</div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalProducts || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Given to Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.totalStockGiven || 0)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.totalStockDelivered || 0)}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.totalStockAvailable || 0)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {(summary.lowStockCount > 0 || summary.expiredCount > 0) && (
        <Card className="mb-6 p-6 border-l-4 border-red-500 bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Stock Alerts</h3>
          <div className="flex gap-4">
            {summary.lowStockCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-red-700">
                  {summary.lowStockCount} products with low stock
                </span>
              </div>
            )}
            {summary.expiredCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700">
                  {summary.expiredCount} products expired
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-48">
            <Select
              options={companyOptions}
              value={filters.company}
              onChange={(value) => handleFilterChange("company", value)}
              placeholder="Filter by company"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filters.lowStock ? "default" : "outline"}
              onClick={() => handleFilterChange("lowStock", !filters.lowStock)}
              size="sm"
            >
              Low Stock
            </Button>
            <Button
              variant={filters.expired ? "default" : "outline"}
              onClick={() => handleFilterChange("expired", !filters.expired)}
              size="sm"
            >
              Expired
            </Button>
          </div>
          <Button onClick={fetchStockData} size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Stock Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Stock Details</h2>
          <Link href="/dashboard/stock/create">
            <Button>Add New Stock</Button>
          </Link>
        </div>
        
        <Table
          columns={columns}
          data={stocks}
          loading={loading}
          emptyMessage="No stock data available"
        />
      </Card>
    </div>
  );
}
