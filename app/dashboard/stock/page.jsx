"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { 
  useStocks, 
  useStockSummary, 
  useStockLoading, 
  useStockError,
  useDeliveryStocks,
  useDeliverySummary,
  useDeliveryStockLoading,
  useDeliveryStockError
} from "@/lib/hooks";
import { 
  fetchStocks, 
  fetchDeliveryStocks, 
  completeDelivery,
  clearError 
} from "@/lib/store/slices/stockSlice";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

export default function StockDashboard() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const stocks = useStocks();
  const summary = useStockSummary();
  const loading = useStockLoading();
  const error = useStockError();
  
  const deliveryStocks = useDeliveryStocks();
  const deliverySummary = useDeliverySummary();
  const deliveryLoading = useDeliveryStockLoading();
  const deliveryError = useDeliveryStockError();
  
  // Local state for UI
  const [activeTab, setActiveTab] = useState("main");
  const [filters, setFilters] = useState({
    lowStock: false,
    expired: false,
  });
  const [deliveryFilters, setDeliveryFilters] = useState({
    deliveryGuyId: "",
    status: "",
    date: "",
  });

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (activeTab === "main") {
      dispatch(fetchStocks(filters));
    } else {
      dispatch(fetchDeliveryStocks(deliveryFilters));
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (activeTab === "main") {
      dispatch(fetchStocks(filters));
    }
  }, [filters.lowStock, filters.expired, dispatch]);

  useEffect(() => {
    if (activeTab === "delivery") {
      dispatch(fetchDeliveryStocks(deliveryFilters));
    }
  }, [deliveryFilters.deliveryGuyId, deliveryFilters.status, deliveryFilters.date, dispatch]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeliveryFilterChange = (field, value) => {
    setDeliveryFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modal helper functions
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getStockStatusColor = (stock) => {
    if (stock.isExpired) return "text-red-600";
    if (stock.isLowStock) return "text-yellow-600";
    return "text-green-600";
  };

  const getStockStatusText = (stock) => {
    if (stock.isExpired) return "Expired";
    if (stock.isLowStock) return "Low Stock";
    return "Normal";
  };

  const handleStatusUpdate = async (row, newStatus) => {
    // Show confirmation modal for completion status
    if (newStatus === "Completed") {
      const confirmMessage = `Are you sure you want to mark this delivery as completed? This action cannot be undone.`;
      
      showModal(
        "warning",
        "Confirm Delivery Completion",
        confirmMessage,
        () => performStatusUpdate(row, newStatus)
      );
      return;
    }

    // For other status changes, update directly
    await performStatusUpdate(row, newStatus);
  };

  const performStatusUpdate = async (row, newStatus) => {
    try {
      const response = await fetch('/api/stock/delivery-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockId: row._id.split('_')[0], // Extract stock ID from combined ID
          agentId: row.deliveryGuyId,
          status: newStatus
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh the delivery stock data to show updated status
        dispatch(fetchDeliveryStocks(deliveryFilters));
        // Also refresh main stocks to update any related data
        dispatch(fetchStocks(filters));
        
        // Show appropriate success message
        if (newStatus === "Completed") {
          showModal(
            "success",
            "Delivery Completed Successfully!",
            `Stock has been moved from in-hand to delivered.\nMain stock delivered amount has been updated.\n\nStock moved: ${formatNumber(row.stockInHand)} ${row.unit}`
          );
        } else {
          showModal(
            "success",
            "Status Updated",
            `Delivery status has been updated to "${newStatus}" successfully!`
          );
        }
      } else {
        const errorData = await response.json();
        showModal(
          "error",
          "Update Failed",
          errorData.message || 'Failed to update status'
        );
      }
    } catch (error) {
      showModal(
        "error",
        "Update Failed",
        'Failed to update status. Please try again.'
      );
    }
  };

  const handleFixAgentStocks = async () => {
    showModal(
      "warning",
      "Fix Agent Stocks",
      "This will fix the agent stock allocations in the database. Continue?",
      async () => {
        try {
          const response = await fetch('/api/stock/fix-agent-stocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            showModal(
              "success",
              "Agent Stocks Fixed",
              `Successfully fixed ${result.results.length} stocks. The data has been refreshed.`
            );
            // Refresh both main and delivery stock data
            dispatch(fetchStocks(filters));
            dispatch(fetchDeliveryStocks(deliveryFilters));
          } else {
            const errorData = await response.json();
            showModal(
              "error",
              "Fix Failed",
              errorData.message || 'Failed to fix agent stocks'
            );
          }
        } catch (error) {
          showModal(
            "error",
            "Fix Failed",
            'Failed to fix agent stocks. Please try again.'
          );
        }
      }
    );
  };

  const handleFixChapatiStock = async () => {
    showModal(
      "warning",
      "Fix Chapati Stock",
      "This will fix the chapati stock allocations specifically. Continue?",
      async () => {
        try {
          const response = await fetch('/api/stock/fix-chapati-stocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            showModal(
              "success",
              "Chapati Stock Fixed",
              "Successfully fixed chapati stock allocations. The data has been refreshed."
            );
            // Refresh both main and delivery stock data
            dispatch(fetchStocks(filters));
            dispatch(fetchDeliveryStocks(deliveryFilters));
          } else {
            const errorData = await response.json();
            showModal(
              "error",
              "Fix Failed",
              errorData.message || 'Failed to fix chapati stock'
            );
          }
        } catch (error) {
          showModal(
            "error",
            "Fix Failed",
            'Failed to fix chapati stock. Please try again.'
          );
        }
      }
    );
  };

  const handleResetChapatiStock = async () => {
    showModal(
      "warning",
      "Reset Chapati Stock",
      "This will reset the chapati stock to initial state (remove all allocations). Continue?",
      async () => {
        try {
          const response = await fetch('/api/stock/reset-chapati', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            showModal(
              "success",
              "Chapati Stock Reset",
              "Successfully reset chapati stock to initial state. The data has been refreshed."
            );
            // Refresh both main and delivery stock data
            dispatch(fetchStocks(filters));
            dispatch(fetchDeliveryStocks(deliveryFilters));
          } else {
            const errorData = await response.json();
            showModal(
              "error",
              "Reset Failed",
              errorData.message || 'Failed to reset chapati stock'
            );
          }
        } catch (error) {
          showModal(
            "error",
            "Reset Failed",
            'Failed to reset chapati stock. Please try again.'
          );
        }
      }
    );
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (value) => (
        <span className="font-medium capitalize">{value}</span>
      ),
    },
    {
      key: "openingStock",
      header: "Opening Stock",
      render: (value, row) => (
        <span className="font-mono">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "totalPurchases",
      header: "Purchases",
      render: (value, row) => (
        <span className="font-mono text-green-600">
          +{formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "totalSales",
      header: "Sales",
      render: (value, row) => (
        <span className="font-mono text-red-600">
          -{formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "closingStock",
      header: "Closing Stock",
      render: (value, row) => (
        <span className={`font-mono font-bold ${getStockStatusColor(row)}`}>
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockGiven",
      header: "Given to Agents",
      render: (value, row) => (
        <span className="font-mono">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockDelivered",
      header: "Delivered",
      render: (value, row) => (
        <span className="font-mono text-blue-600">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "salesReturns",
      header: "Returns",
      render: (value, row) => (
        <span className="font-mono text-orange-600">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockAvailable",
      header: "Available",
      render: (value, row) => (
        <span className="font-mono font-bold">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isExpired
              ? "bg-red-100 text-red-800"
              : row.isLowStock
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}>
          {getStockStatusText(row)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/stock/${row._id}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/stock/${row._id}/allocate`}>
            <Button size="sm" variant="outline">
              Allocate
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const deliveryGuyOptions = [
    { value: "", label: "All Delivery Guys" },
    { value: "DG001", label: "Rajesh Kumar" },
    { value: "DG002", label: "Suresh Singh" },
    { value: "DG003", label: "Amit Sharma" },
    { value: "DG004", label: "Vikram Patel" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
  ];

  // Use delivery stock data from API
  const getDeliveryStockData = () => {
    return deliveryStocks || [];
  };

  // Delivery Stock Columns
  const deliveryColumns = [
    {
      key: "deliveryGuyName",
      header: "Delivery Guy",
      render: (value, row) => (
        <div>
          <span className="font-medium">{value}</span>
          <div className="text-xs text-gray-500">{row.deliveryGuyId}</div>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (value) => (
        <span className="font-medium capitalize">{value}</span>
      ),
    },
    {
      key: "stockAllocated",
      header: "Stock Allocated",
      render: (value, row) => (
        <span className="font-mono text-blue-600">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockDelivered",
      header: "Stock Delivered",
      render: (value, row) => (
        <span className="font-mono text-green-600">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockReturned",
      header: "Stock Returned",
      render: (value, row) => (
        <span className="font-mono text-orange-600">
          {formatNumber(value)} {row.unit}
        </span>
      ),
    },
    {
      key: "stockInHand",
      header: "Stock in Hand",
      render: (value, row) => (
        <span className={`font-mono font-bold ${
          value > 0 ? "text-indigo-600" : "text-gray-500"
        }`}>
          {formatNumber(value)} {row.unit}
          {value === 0 && row.status === "Completed" && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✓ Delivered
            </span>
          )}
        </span>
      ),
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      render: (value) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <select
          value={value || "Active"}
          onChange={(e) => handleStatusUpdate(row, e.target.value)}
          className="w-36 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Active">Active</option>
          <option value="In Progress">In Progress</option>
          <option 
            value="Completed" 
            disabled={row.stockInHand === 0 && value !== "Completed"}
            style={{ 
              color: row.stockInHand === 0 && value !== "Completed" ? '#9CA3AF' : 'inherit' 
            }}
          >
            Completed {row.stockInHand === 0 && value !== "Completed" ? "(No stock in hand)" : ""}
          </option>
        </select>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/stock/${row._id.split('_')[0]}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Stock Management
        </h1>
        <p className="text-gray-600">
          Comprehensive stock tracking for main inventory and delivery personnel
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("main")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "main"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Main Inventory
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "delivery"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Delivery Guys Stock
            </button>
          </nav>
        </div>
      </div>

      {/* Main Inventory Tab */}
      {activeTab === "main" && (
        <>
          {/* Stock Formula Display */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Main Inventory Formula
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
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
            </div>
          </Card>
        </>
      )}

      {/* Delivery Stock Tab */}
      {activeTab === "delivery" && (
        <>
          {/* Delivery Stock Formula Display */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Delivery Guys Stock Formula
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(deliverySummary?.totalStockAllocated || 0)}
                </div>
                <div className="text-sm text-gray-600">Stock Allocated</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">
                  - {formatNumber(deliverySummary?.totalStockDelivered || 0)}
                </div>
                <div className="text-sm text-gray-600">Stock Delivered</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">
                  + {formatNumber(deliverySummary?.totalStockReturned || 0)}
                </div>
                <div className="text-sm text-gray-600">Stock Returned</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">
                  = {formatNumber(deliverySummary?.totalStockInHand || 0)}
                </div>
                <div className="text-sm text-gray-600">Stock in Hand</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Summary Cards */}
      {activeTab === "main" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.totalProducts || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
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

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Given to Agents
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(summary?.totalStockGiven || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Delivered
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(summary?.totalStockDelivered || 0)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Available
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(summary?.totalStockAvailable || 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delivery Summary Cards */}
      {activeTab === "delivery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Delivery Guys
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliverySummary?.totalDeliveryGuys || 0}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Allocated
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(deliverySummary?.totalStockAllocated || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Delivered
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(deliverySummary?.totalStockDelivered || 0)}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock in Hand
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(deliverySummary?.totalStockInHand || 0)}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Deliveries
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {deliverySummary?.activeDeliveries || 0}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Inventory Alerts */}
      {activeTab === "main" && ((summary?.lowStockCount || 0) > 0 || (summary?.expiredCount || 0) > 0) && (
        <Card className="mb-6 p-6 border-l-4 border-red-500 bg-red-50">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Stock Alerts
          </h3>
          <div className="flex gap-4">
            {(summary?.lowStockCount || 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-red-700">
                  {summary?.lowStockCount || 0} products with low stock
                </span>
              </div>
            )}
            {(summary?.expiredCount || 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700">
                  {summary?.expiredCount || 0} products expired
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Inventory Filters */}
      {activeTab === "main" && (
        <Card className="mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={filters.lowStock ? "default" : "outline"}
                onClick={() => handleFilterChange("lowStock", !filters.lowStock)}
                size="sm">
                Low Stock
              </Button>
              <Button
                variant={filters.expired ? "default" : "outline"}
                onClick={() => handleFilterChange("expired", !filters.expired)}
                size="sm">
                Expired
              </Button>
            </div>
            <Button onClick={() => dispatch(fetchStocks(filters))} size="sm">
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* Delivery Stock Filters */}
      {activeTab === "delivery" && (
        <Card className="mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-48">
              <Select
                options={deliveryGuyOptions}
                value={deliveryFilters.deliveryGuyId}
                onChange={(value) => handleDeliveryFilterChange("deliveryGuyId", value)}
                placeholder="Filter by delivery guy"
              />
            </div>
            <div className="flex-1 min-w-48">
              <Select
                options={statusOptions}
                value={deliveryFilters.status}
                onChange={(value) => handleDeliveryFilterChange("status", value)}
                placeholder="Filter by status"
              />
            </div>
            <div className="flex-1 min-w-48">
              <input
                type="date"
                value={deliveryFilters.date}
                onChange={(e) => handleDeliveryFilterChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by date"
              />
            </div>
            <Button onClick={() => dispatch(fetchDeliveryStocks(deliveryFilters))} size="sm">
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* Main Stock Table */}
      {activeTab === "main" && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Main Inventory</h2>
            <Link href="/dashboard/stock/create">
              <Button>Add New Stock</Button>
            </Link>
          </div>

          <Table
            columns={columns}
            data={stocks}
            loading={loading}
            emptyMessage="No stock data available"
          />
        </Card>
      )}

      {/* Delivery Stock Table */}
      {activeTab === "delivery" && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Delivery Guys Stock</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  dispatch(fetchDeliveryStocks(deliveryFilters));
                  dispatch(fetchStocks(filters));
                }}
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                Refresh Data
              </Button>
              <Button 
                onClick={handleResetChapatiStock}
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                Reset Chapati
              </Button>
              <Button 
                onClick={handleFixChapatiStock}
                variant="outline"
                size="sm"
              >
                Fix Chapati Stock
              </Button>
              <Button 
                onClick={handleFixAgentStocks}
                variant="outline"
                size="sm"
              >
                Fix All Stocks
              </Button>
              <Link href="/dashboard/stock/create">
                <Button>Allocate Stock to Agents</Button>
              </Link>
            </div>
          </div>

          <Table
            columns={deliveryColumns}
            data={getDeliveryStockData()}
            loading={deliveryLoading}
            emptyMessage="No delivery stock allocations found. Allocate stock to agents first."
          />
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        showCancelButton={modal.type === "warning"}
        confirmText={modal.type === "warning" ? "Yes, Continue" : "OK"}
        cancelText="Cancel"
      />
    </div>
  );
}