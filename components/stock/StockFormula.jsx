"use client";

import React, { memo } from "react";
import Card from "@/components/ui/Card";

const StockFormula = memo(({ summary, formatNumber, title, type = "main" }) => {
  const isMain = type === "main";
  
  return (
    <Card className={`mb-6 p-6 ${isMain ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        {isMain ? (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(summary?.totalOpeningStock || 0)}
              </div>
              <div className="text-sm text-gray-600">Opening Stock</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                + {formatNumber(summary?.totalPurchases || 0)}
              </div>
              <div className="text-sm text-gray-600">Purchases</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                - {formatNumber(summary?.totalSales || 0)}
              </div>
              <div className="text-sm text-gray-600">Sales</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                = {formatNumber(summary?.totalClosingStock || 0)}
              </div>
              <div className="text-sm text-gray-600">Closing Stock</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(summary?.totalStockAllocated || 0)}
              </div>
              <div className="text-sm text-gray-600">Stock Allocated</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                - {formatNumber(summary?.totalStockDelivered || 0)}
              </div>
              <div className="text-sm text-gray-600">Stock Delivered</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                + {formatNumber(summary?.totalStockReturned || 0)}
              </div>
              <div className="text-sm text-gray-600">Stock Returned</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                = {formatNumber(summary?.totalStockInHand || 0)}
              </div>
              <div className="text-sm text-gray-600">Stock in Hand</div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
});

StockFormula.displayName = "StockFormula";

export default StockFormula;

