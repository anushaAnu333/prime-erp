"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const DashboardClient = ({ user }) => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    activeShops: 0,
    invoicesGenerated: 0,
    averageOrderValue: 0,
    topProduct: { name: "Product Name", revenue: 0 },
    salesTrend: [],
    shopsPerformance: [],
    invoicesOverview: [],
    topProducts: [],
    recentInvoices: [],
    lowStockAlerts: []
  });
  const [filters, setFilters] = useState({
    company: "",
    channel: "",
    shop: "",
    dateRange: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [salesResponse, customersResponse, productsResponse, purchasesResponse] =
        await Promise.all([
          fetch("/api/sales?limit=100"),
          fetch("/api/customers?limit=100"),
          fetch("/api/products?limit=100"),
          fetch("/api/purchases?limit=100"),
        ]);

      // Check if all responses are ok
      if (!salesResponse.ok || !customersResponse.ok || !productsResponse.ok || !purchasesResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      // Parse all responses in parallel
      const [salesData, customersData, productsData, purchasesData] = await Promise.all([
        salesResponse.json(),
        customersResponse.json(),
        productsResponse.json(),
        purchasesResponse.json(),
      ]);

      // Calculate statistics
      const totalSales = salesData.sales?.length || 0;
      const totalPurchases = purchasesData.purchases?.length || 0;
      const totalRevenue = salesData.sales?.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0) || 0;
      const activeShops = customersData.customers?.filter(c => c.isActive).length || 0;
      const invoicesGenerated = totalSales;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Mock data for charts and lists
      const salesTrend = [
        { month: 'May', sales: 25000, purchases: 18000 },
        { month: 'Jun', sales: 32000, purchases: 22000 },
        { month: 'Jul', sales: 28000, purchases: 20000 },
        { month: 'Aug', sales: 45000, purchases: 30000 },
        { month: 'Sep', sales: 52000, purchases: 35000 },
        { month: 'Oct', sales: 48000, purchases: 32000 }
      ];

      const shopsPerformance = [
        { name: 'Shop A', performance: 100 },
        { name: 'Shop B', performance: 70 },
        { name: 'Shop C', performance: 50 },
        { name: 'Shop D', performance: 25 }
      ];

      const invoicesOverview = [
        { name: 'Wholesale', value: 65, color: '#3B82F6' },
        { name: 'Retail', value: 35, color: '#9CA3AF' }
      ];

      const topProducts = [
        { name: 'Product 1', units: 150, revenue: 9500, growth: 12 },
        { name: 'Product 2', units: 120, revenue: 6800, growth: 8 },
        { name: 'Product 3', units: 90, revenue: 4200, growth: -3 }
      ];

      const recentInvoices = salesData.sales?.slice(0, 5).map(sale => ({
        invoiceNumber: sale.invoiceNumber,
        shop: sale.customerDetails?.shopName || 'Unknown Shop',
        amount: sale.finalAmount,
        status: sale.paymentStatus || 'Pending',
        date: sale.invoiceDate
      })) || [];

      const lowStockAlerts = productsData.products?.filter(p => p.quantity < 10).slice(0, 3) || [];

      setStats({
        totalPurchases,
        totalSales,
        activeShops,
        invoicesGenerated,
        averageOrderValue,
        topProduct: { name: "Product Name", revenue: 12780 },
        salesTrend,
        shopsPerformance,
        invoicesOverview,
        topProducts,
        recentInvoices,
        lowStockAlerts
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values on error
      setStats({
        totalPurchases: 0,
        totalSales: 0,
        activeShops: 0,
        invoicesGenerated: 0,
        averageOrderValue: 0,
        topProduct: { name: "Product Name", revenue: 0 },
        salesTrend: [],
        shopsPerformance: [],
        invoicesOverview: [],
        topProducts: [],
        recentInvoices: [],
        lowStockAlerts: []
      });
    } finally {
      setLoading(false);
    }
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

  const companyOptions = [
    { value: "", label: "All Companies" },
    { value: "PRIMA-SM", label: "Prima Sales & Marketing" },
    { value: "PRIMA-FT", label: "Prima Foodtech" },
    { value: "PRIMA-EX", label: "Prima Exports" }
  ];

  const channelOptions = [
    { value: "", label: "All Channels" },
    { value: "wholesale", label: "Wholesale" },
    { value: "retail", label: "Retail" }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
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
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            placeholder="Select Company"
            options={companyOptions}
            value={filters.company}
            onChange={(value) => setFilters(prev => ({ ...prev, company: value }))}
          />
          <Select
            placeholder="Select Channel"
            options={channelOptions}
            value={filters.channel}
            onChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}
          />
          <Input
            type="text"
            placeholder="Search Shop..."
            value={filters.shop}
            onChange={(e) => setFilters(prev => ({ ...prev, shop: e.target.value }))}
          />
          <Input
            type="date"
            placeholder="Date Range"
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          />
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Total Purchases</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(32450)}</div>
          <div className="text-xs text-gray-500">2-3 companies</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Total Sales</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(85940)}</div>
          <div className="text-xs text-gray-500">100-150 shops</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Active Shops</div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeShops}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Invoices Generated</div>
          <div className="text-2xl font-bold text-gray-900">{stats.invoicesGenerated}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Average Order Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600">Top Product</div>
          <div className="text-lg font-bold text-gray-900">{stats.topProduct.name}</div>
          <div className="text-xs text-gray-500">{formatCurrency(stats.topProduct.revenue)}</div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales vs Purchases Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales" />
              <Line type="monotone" dataKey="purchases" stroke="#1E40AF" strokeWidth={2} name="Purchases" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Shops Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shops Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.shopsPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="performance" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Invoices Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices Overview</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={stats.invoicesOverview}
                cx={150}
                cy={150}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.invoicesOverview.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="ml-8">
            <div className="text-3xl font-bold text-gray-900">65%</div>
            <div className="text-sm text-gray-600">Wholesale</div>
          </div>
        </div>
      </Card>

      {/* Top Products and Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.units} units • {formatCurrency(product.revenue)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  product.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.growth >= 0 ? '+' : ''}{product.growth}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Invoices */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {stats.recentInvoices.map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{invoice.shop}</p>
                  <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
                  <Button size="sm" variant="outline" className="mt-1">View</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockAlerts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {stats.lowStockAlerts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-red-600">Only {product.quantity} units left</p>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  Reorder
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardClient;
