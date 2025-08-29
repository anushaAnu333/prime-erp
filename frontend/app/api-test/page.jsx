"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

export default function ApiTestPage() {
  const [apiResult, setApiResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Testing API call...");
      const result = await apiClient.getDashboard();
      console.log("API result:", result);
      setApiResult(result);
    } catch (err) {
      console.error("API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              API Test Results
            </h2>

            <div className="space-y-4">
              <div>
                <button
                  onClick={testApi}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Testing..." : "Test API Call"}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold">Error:</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {apiResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-green-800 font-semibold">Success!</h3>
                  <pre className="text-sm text-green-700 overflow-auto">
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
