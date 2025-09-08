"use client";

import { useEffect, useCallback, useMemo } from "react";
import Card from "@/components/ui/Card";
import { useAppDispatch } from "../lib/hooks";
import { useDashboardData } from "../lib/hooks";
import { fetchDashboardData } from "../lib/store/slices/dashboardSlice";
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
  const dispatch = useAppDispatch();
  const { loading, error, ...stats } = useDashboardData();

  // OPTIMIZED: Memoize the fetch function to prevent unnecessary re-renders
  const fetchData = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // OPTIMIZED: Memoize the format function
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Error Loading Dashboard Data
            </div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={() => dispatch(fetchDashboardData())}
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
            {stats.salesTrend && stats.salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
              <div className="flex items-center justify-center h-[250px] text-gray-500">
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
              <div className="flex items-center justify-center h-[250px]">
                <ResponsiveContainer width={250} height={250}>
                  <PieChart>
                    <Pie
                      data={stats.topProducts}
                      cx={125}
                      cy={125}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="revenue">
                      {stats.topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#3B82F6",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ fontSize: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ml-6">
                  <div className="space-y-2">
                    {stats.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: [
                              "#3B82F6",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index % 5],
                          }}></div>
                        <span className="text-sm text-gray-600">
                          {product.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No product data available
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Monthly Revenue Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Revenue Trend
            </h3>
            {stats.salesTrend && stats.salesTrend.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.salesTrend}>
                    <XAxis
                      dataKey="month"
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ fontSize: 10 }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10B981"
                      radius={[2, 2, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    No revenue data available
                  </div>
                  <div className="text-sm text-gray-400">
                    Start creating sales to see trends
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Invoices Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Business Overview
            </h3>
            <div className="grid grid-cols-2 gap-4 h-[250px]">
              {/* Customers */}
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.overview?.totalCustomers || 0}
                </div>
                <div className="text-sm font-medium text-blue-800">
                  Total Customers
                </div>
              </div>

              {/* Vendors */}
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.overview?.totalVendors || 0}
                </div>
                <div className="text-sm font-medium text-green-800">
                  Total Vendors
                </div>
              </div>

              {/* Sales */}
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1 truncate">
                  {typeof stats.overview?.totalSales === "number"
                    ? Math.round(stats.overview.totalSales).toLocaleString()
                    : stats.overview?.totalSales || 0}
                </div>
                <div className="text-sm font-medium text-purple-800">
                  Total Sales
                </div>
              </div>

              {/* Purchases */}
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1 truncate">
                  {typeof stats.overview?.totalPurchases === "number"
                    ? Math.round(stats.overview.totalPurchases).toLocaleString()
                    : stats.overview?.totalPurchases || 0}
                </div>
                <div className="text-sm font-medium text-orange-800">
                  Total Purchases
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
