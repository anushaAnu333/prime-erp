"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardClient = ({ user }) => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    activeShops: 0,
    topProduct: { name: "No Products", revenue: 0 },
    salesTrend: [],
    shopsPerformance: [],
    invoicesOverview: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data...");
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dashboard data received:", data);
      console.log("Top Products data:", data.topProducts);
      console.log("Shops Performance data:", data.shopsPerformance);
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Debug logging for chart data
  useEffect(() => {
    console.log("Current stats state:", stats);
    console.log("Top Products for chart:", stats.topProducts);
    console.log("Shops Performance for chart:", stats.shopsPerformance);
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600" disabled>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600" disabled>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Error Loading Dashboard Data
            </div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">
            Total Purchases
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalPurchases)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.totalPurchases > 0 ? "All companies" : "No purchases"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Total Sales</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalSales)}
          </div>
          <div className="text-xs text-gray-500">
            {stats.totalSales > 0 ? "All shops" : "No sales"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Active Shops</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.activeShops}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Top Product</div>
          <div className="text-lg font-bold text-gray-900">
            {stats.topProduct.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatCurrency(stats.topProduct.revenue)}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Sales vs Purchases Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sales vs Purchases Trend
            </h3>
            {stats.salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.salesTrend}>
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="#1E40AF"
                    strokeWidth={2}
                    name="Purchases"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No trend data available
              </div>
            )}
          </Card>

          {/* Top Products */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Products
            </h3>
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {stats.topProducts.length} products found
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topProducts} layout="horizontal">
                    <XAxis
                      type="number"
                      domain={[
                        0,
                        Math.max(...stats.topProducts.map((p) => p.revenue)) +
                          1000,
                      ]}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ fontSize: 10 }}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No product data available
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Shops Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shops Performance
            </h3>
            {stats.shopsPerformance && stats.shopsPerformance.length > 0 ? (
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {stats.shopsPerformance.length} shops found
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.shopsPerformance} layout="horizontal">
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{ fontSize: 10 }}
                    />
                    <Bar dataKey="performance" fill="#3B82F6" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No shops performance data available
              </div>
            )}
          </Card>

          {/* Invoices Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invoices Overview
            </h3>
            {stats.invoicesOverview.length > 0 &&
            stats.invoicesOverview[0].value > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={stats.invoicesOverview}
                      cx={150}
                      cy={150}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value">
                      {stats.invoicesOverview.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{ fontSize: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-8">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.invoicesOverview[0]?.value || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Wholesale</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No invoice data available
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
