"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Table from "../ui/Table";
import { formatCurrency } from "@/lib/utils";
import {
  fetchSaleReturns,
  selectSaleReturns,
  selectReturnsLoading,
  selectReturnsError,
} from "@/lib/store/slices/salesSlice";

const SaleReturnInfo = ({ saleId, saleData }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const returns = useSelector(selectSaleReturns);
  const loading = useSelector(selectReturnsLoading);
  const error = useSelector(selectReturnsError);

  const [returnStats, setReturnStats] = useState({
    totalReturned: 0,
    returnCount: 0,
    returnStatus: "None",
  });

  // Fetch returns when component mounts
  useEffect(() => {
    if (saleId) {
      dispatch(fetchSaleReturns(saleId));
    }
  }, [dispatch, saleId]);

  // Calculate return statistics
  useEffect(() => {
    if (returns && returns.length > 0) {
      const totalReturned = returns.reduce((sum, ret) => sum + (ret.total || 0), 0);
      const saleTotal = saleData?.total || 0;
      
      let status = "None";
      if (totalReturned > 0) {
        status = totalReturned >= saleTotal ? "Full" : "Partial";
      }

      setReturnStats({
        totalReturned,
        returnCount: returns.length,
        returnStatus: status,
      });
    } else {
      setReturnStats({
        totalReturned: 0,
        returnCount: 0,
        returnStatus: "None",
      });
    }
  }, [returns, saleData]);

  const handleCreateReturn = () => {
    router.push(`/dashboard/sales/returns/create?saleId=${saleId}`);
  };

  const handleViewReturn = (returnId) => {
    router.push(`/dashboard/sales/${returnId}`);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      None: "bg-gray-100 text-gray-800",
      Partial: "bg-yellow-100 text-yellow-800",
      Full: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusStyles[status] || statusStyles.None
        }`}
      >
        {status}
      </span>
    );
  };

  const returnColumns = [
    {
      key: "invoiceNumber",
      label: "Return Number",
      render: (value, row) => (
        <button
          onClick={() => handleViewReturn(row._id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      key: "date",
      label: "Return Date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "total",
      label: "Return Amount",
      render: (value) => formatCurrency(value),
    },
    {
      key: "items",
      label: "Items Count",
      render: (items) => items?.length || 0,
    },
  ];

  if (!saleId || !saleData) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Return Information</h3>
        {returnStats.returnStatus !== "Full" && (
          <Button
            onClick={handleCreateReturn}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Create Return
          </Button>
        )}
      </div>

      {/* Return Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Return Status</div>
          <div className="mt-1">
            {getStatusBadge(returnStats.returnStatus)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Returns Count</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {returnStats.returnCount}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Total Returned</div>
          <div className="mt-1 text-lg font-semibold text-red-600">
            {formatCurrency(returnStats.totalReturned)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Remaining Value</div>
          <div className="mt-1 text-lg font-semibold text-green-600">
            {formatCurrency((saleData?.total || 0) - returnStats.totalReturned)}
          </div>
        </div>
      </div>

      {/* Returns List */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-500">Loading returns...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {returns && returns.length > 0 ? (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Return History</h4>
          <Table
            columns={returnColumns}
            data={returns}
            loading={loading}
            emptyMessage="No returns found"
          />
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No returns created for this sale</div>
            {returnStats.returnStatus !== "Full" && (
              <Button
                onClick={handleCreateReturn}
                variant="outline"
                className="px-6 py-2"
              >
                Create First Return
              </Button>
            )}
          </div>
        )
      )}
    </Card>
  );
};

export default SaleReturnInfo;


