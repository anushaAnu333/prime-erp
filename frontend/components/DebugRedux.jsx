"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { useDashboardData } from "@/lib/hooks";
import { fetchDashboardData } from "@/lib/store/slices/dashboardSlice";
import apiClient from "@/lib/api";

const DebugRedux = () => {
  const dispatch = useAppDispatch();
  const dashboardData = useDashboardData();
  const { loading, error } = useDashboardData();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const testRedux = async () => {
      console.log("Testing Redux...");

      // Test direct API call first
      try {
        console.log("Testing direct API call...");
        const directResponse = await apiClient.getDashboard();
        console.log("Direct API response:", directResponse);
        setDebugInfo((prev) => ({
          ...prev,
          directApiResponse: directResponse,
        }));
      } catch (error) {
        console.error("Direct API error:", error);
        setDebugInfo((prev) => ({ ...prev, directApiError: error.message }));
      }

      // Test Redux action
      try {
        console.log("Dispatching Redux action...");
        const result = await dispatch(fetchDashboardData()).unwrap();
        console.log("Redux action result:", result);
        setDebugInfo((prev) => ({ ...prev, reduxActionResult: result }));
      } catch (error) {
        console.error("Redux action error:", error);
        setDebugInfo((prev) => ({ ...prev, reduxActionError: error.message }));
      }
    };

    testRedux();
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Redux Debug</h2>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <pre className="text-xs">
          {JSON.stringify(
            {
              loading,
              error,
              hasData: !!dashboardData,
              overview: dashboardData.overview,
              salesTrend: dashboardData.salesTrend?.length || 0,
              topProducts: dashboardData.topProducts?.length || 0,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Actions:</h3>
        <button
          onClick={async () => {
            try {
              const result = await dispatch(fetchDashboardData()).unwrap();
              console.log("Manual dispatch result:", result);
              setDebugInfo((prev) => ({
                ...prev,
                manualDispatchResult: result,
              }));
            } catch (error) {
              console.error("Manual dispatch error:", error);
              setDebugInfo((prev) => ({
                ...prev,
                manualDispatchError: error.message,
              }));
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Fetch Dashboard Data
        </button>
      </div>
    </div>
  );
};

export default DebugRedux;
