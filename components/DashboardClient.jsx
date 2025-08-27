"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { getRoleDisplayName, getRoleColor } from "@/lib/utils";

const DashboardClient = ({ user }) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentSales: [],
    topProducts: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [salesResponse, customersResponse, productsResponse] = await Promise.all([
        fetch("/api/sales?limit=100"),
        fetch("/api/customers?limit=100"),
        fetch("/api/products?limit=100")
      ]);

      // Check if all responses are ok
      if (!salesResponse.ok || !customersResponse.ok || !productsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      // Parse all responses in parallel
      const [salesData, customersData, productsData] = await Promise.all([
        salesResponse.json(),
        customersResponse.json(),
        productsResponse.json()
      ]);

      // Calculate statistics
      const totalSales = salesData.sales?.length || 0;
      const totalRevenue =
        salesData.sales?.reduce(
          (sum, sale) => sum + (sale.finalAmount || 0),
          0
        ) || 0;
      const totalCustomers = customersData.customers?.length || 0;
      const totalProducts = productsData.products?.length || 0;

      // Get recent sales (last 5)
      const recentSales = salesData.sales?.slice(0, 5) || [];

      // Calculate monthly revenue for chart
      const monthlyRevenue = calculateMonthlyRevenue(salesData.sales || []);

      // Get top products
      const topProducts = calculateTopProducts(salesData.sales || []);

      setStats({
        totalSales,
        totalRevenue,
        totalCustomers,
        totalProducts,
        recentSales,
        topProducts,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values on error
      setStats({
        totalSales: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentSales: [],
        topProducts: [],
        monthlyRevenue: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (sales) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = months.map((month, index) => {
      const monthSales = sales.filter((sale) => {
        const saleDate = new Date(sale.invoiceDate);
        return (
          saleDate.getMonth() === index &&
          saleDate.getFullYear() === new Date().getFullYear()
        );
      });
      const revenue = monthSales.reduce(
        (sum, sale) => sum + (sale.finalAmount || 0),
        0
      );
      return { month, revenue };
    });
    return monthlyData;
  };

  const calculateTopProducts = (sales) => {
    const productSales = {};
    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const productName = item.productName || "Unknown Product";
        productSales[productName] =
          (productSales[productName] || 0) + (item.quantity || 0);
      });
    });

    return Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalSales}
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <Card.Title>Monthly Revenue</Card.Title>
          <div className="mt-4">
            <div className="flex items-end justify-between h-48 space-x-2">
              {stats.monthlyRevenue.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 mb-1">{data.month}</div>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{
                      height: `${Math.max(
                        (data.revenue /
                          Math.max(
                            ...stats.monthlyRevenue.map((d) => d.revenue)
                          )) *
                          100,
                        5
                      )}%`,
                      minHeight: "4px",
                    }}></div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatCurrency(data.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <Card.Title>Top Selling Products</Card.Title>
          <div className="mt-4 space-y-3">
            {stats.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (product.quantity /
                            Math.max(
                              ...stats.topProducts.map((p) => p.quantity)
                            )) *
                          100
                        }%`,
                      }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <Card.Title>Recent Sales</Card.Title>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentSales.map((sale, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sale.customerDetails?.shopName || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {sale.customerDetails?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sale.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(sale.finalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Create New Sale
            </h3>
            <p className="text-blue-700">
              Generate a new invoice for your customer
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Add Customer
            </h3>
            <p className="text-green-700">
              Register a new customer to your system
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              View Reports
            </h3>
            <p className="text-purple-700">Analyze your business performance</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardClient;
