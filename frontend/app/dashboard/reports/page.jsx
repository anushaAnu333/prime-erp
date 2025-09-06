'use client';

import { useState, useEffect } from 'react';
// Simple SVG icons to replace lucide-react
const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Download = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const Package = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerId: '',
    vendorName: '',
    days: 30
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType, format = 'csv') => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params.get(key)) {
          params.delete(key);
        }
      });
      
      const response = await fetch(`/api/reports/${reportType}?${params}`);
      
      if (response.ok) {
        if (format === 'csv' || format === 'pdf') {
          // Handle file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'html'}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error downloading ${reportType} report:`, error);
      alert('Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="mt-1 text-gray-600">Complete business reports and analytics</p>
      </div>

      {/* Dashboard Summary Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{dashboardData.sales.today.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.sales.today.count} transactions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Month's Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{dashboardData.sales.month.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.sales.month.count} transactions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Purchases</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{dashboardData.purchases.today.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.purchases.today.count} transactions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.customers.total}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.customers.active} active
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
        </div>
      )}

      {/* Reports Section */}
      <div className="space-y-6">
        
        {/* Sales Report Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Sales Report
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('sales', 'csv')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => downloadReport('sales', 'pdf')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Generate detailed sales reports with filtering options</p>
          
          {/* Sales Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer ID</label>
              <input
                type="text"
                value={filters.customerId}
                onChange={(e) => setFilters({...filters, customerId: e.target.value})}
                placeholder="Optional"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Customer Balance Report Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Customer Balance Report
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('customer-balance', 'csv')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => downloadReport('customer-balance', 'pdf')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Complete customer ledger with opening balance, sales, returns, and payments</p>
        </div>

        {/* Purchase Report Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Purchase Report
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('purchases', 'csv')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => downloadReport('purchases', 'pdf')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Vendor-wise purchase analysis and reporting</p>
          
          {/* Purchase Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
              <input
                type="text"
                value={filters.vendorName}
                onChange={(e) => setFilters({...filters, vendorName: e.target.value})}
                placeholder="Optional"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Expiry Report Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-red-600" />
              Product Expiry Report
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('expiry', 'csv')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => downloadReport('expiry', 'pdf')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">Track products that are expiring soon or have already expired</p>
          
          {/* Expiry Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Days to Expiry</label>
              <select
                value={filters.days || 30}
                onChange={(e) => setFilters({...filters, days: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                Shows products expiring within the selected timeframe
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Generating report...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
