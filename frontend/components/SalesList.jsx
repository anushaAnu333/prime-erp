"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { useSalesList, useSales } from "@/lib/hooks";
import { fetchSales } from "@/lib/store/slices/salesSlice";
import Card from "./ui/Card";

const SalesList = () => {
  const dispatch = useAppDispatch();
  const sales = useSalesList();
  const { loading, error, total } = useSales();

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Error Loading Sales
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => dispatch(fetchSales())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Sales List</h2>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>

      {sales.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-gray-500">No sales found</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.slice(0, 10).map((sale) => (
            <Card key={sale._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {sale.invoiceNo}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {sale.customerName} - {sale.shopName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{sale.total?.toLocaleString() || 0}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sale.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : sale.paymentStatus === "Partial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {sale.paymentStatus}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesList;
