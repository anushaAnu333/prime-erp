"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { useDashboardData, useSalesList } from "@/lib/hooks";
import { fetchDashboardData } from "@/lib/store/slices/dashboardSlice";
import { fetchSales } from "@/lib/store/slices/salesSlice";

const ReduxTest = () => {
  const dispatch = useAppDispatch();
  const dashboardData = useDashboardData();
  const salesData = useSalesList();

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchSales());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Redux Test Component</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dashboard Data Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard Data (Redux)
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Total Sales: {dashboardData.overview?.totalSales || 0}
            </p>
            <p className="text-sm text-gray-600">
              Total Customers: {dashboardData.overview?.totalCustomers || 0}
            </p>
            <p className="text-sm text-gray-600">
              Total Products: {dashboardData.overview?.totalProducts || 0}
            </p>
            <p className="text-sm text-gray-600">
              Sales Trend Data: {dashboardData.salesTrend?.length || 0} items
            </p>
            <p className="text-sm text-gray-600">
              Top Products: {dashboardData.topProducts?.length || 0} items
            </p>
            <p className="text-sm text-gray-600">
              Loading: {dashboardData.loading ? "Yes" : "No"}
            </p>
            {dashboardData.error && (
              <p className="text-sm text-red-600">
                Error: {dashboardData.error}
              </p>
            )}
          </div>
        </div>

        {/* Sales Data Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Data (Redux)
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Total Sales: {salesData.sales?.length || 0}
            </p>
            <p className="text-sm text-gray-600">
              Loading: {salesData.loading ? "Yes" : "No"}
            </p>
            {salesData.error && (
              <p className="text-sm text-red-600">Error: {salesData.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Redux State Structure */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Redux State Structure
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs text-gray-700 overflow-auto">
            {JSON.stringify(
              {
                dashboard: {
                  overview: dashboardData.overview,
                  salesTrend: dashboardData.salesTrend?.length || 0,
                  topProducts: dashboardData.topProducts?.length || 0,
                  loading: dashboardData.loading,
                  error: dashboardData.error,
                },
                sales: {
                  count: salesData.sales?.length || 0,
                  sample:
                    salesData.sales?.slice(0, 2).map((s) => ({
                      id: s._id,
                      invoiceNo: s.invoiceNo,
                      total: s.total,
                    })) || [],
                  loading: salesData.loading,
                  error: salesData.error,
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ReduxTest;
