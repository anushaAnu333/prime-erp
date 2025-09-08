"use client";

import React, { memo, useCallback, useMemo } from "react";
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
  clearError 
} from "@/lib/store/slices/stockSlice";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import StockFormula from "./StockFormula";
import StockSummaryCards from "./StockSummaryCards";
import StockFilters from "./StockFilters";

const StockDashboard = memo(() => {
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
  const [activeTab, setActiveTab] = React.useState("main");
  const [filters, setFilters] = React.useState({
    lowStock: false,
    expired: false,
  });
  const [deliveryFilters, setDeliveryFilters] = React.useState({
    deliveryGuyId: "",
    status: "",
    date: "",
  });

  // Modal state
  const [modal, setModal] = React.useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  // Memoized format function
  const formatNumber = useCallback((num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  }, []);

  // Memoized filter handlers
  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleDeliveryFilterChange = useCallback((field, value) => {
    setDeliveryFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Memoized refresh handlers
  const handleMainRefresh = useCallback(() => {
    dispatch(fetchStocks(filters));
  }, [dispatch, filters]);

  const handleDeliveryRefresh = useCallback(() => {
    dispatch(fetchDeliveryStocks(deliveryFilters));
  }, [dispatch, deliveryFilters]);

  // Modal helper functions
  const showModal = useCallback((type, title, message, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
      onConfirm: null,
    });
  }, []);

  // Memoized columns
  const columns = useMemo(() => [
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
        <span className={`font-mono font-bold ${
          row.isExpired ? "text-red-600" : 
          row.isLowStock ? "text-yellow-600" : "text-green-600"
        }`}>
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
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/stock/${row._id}/edit`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
          <Link href={`/dashboard/stock/${row._id}/allocate`}>
            <Button size="sm" variant="outline">Allocate</Button>
          </Link>
        </div>
      ),
    },
  ], [formatNumber]);

  // Effects
  React.useEffect(() => {
    if (activeTab === "main") {
      dispatch(fetchStocks(filters));
    } else {
      dispatch(fetchDeliveryStocks(deliveryFilters));
    }
  }, [activeTab, dispatch]);

  React.useEffect(() => {
    if (activeTab === "main") {
      dispatch(fetchStocks(filters));
    }
  }, [filters.lowStock, filters.expired, dispatch, activeTab]);

  React.useEffect(() => {
    if (activeTab === "delivery") {
      dispatch(fetchDeliveryStocks(deliveryFilters));
    }
  }, [deliveryFilters.deliveryGuyId, deliveryFilters.status, deliveryFilters.date, dispatch, activeTab]);

  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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

      {/* Formula Display */}
      {activeTab === "main" && (
        <StockFormula 
          summary={summary} 
          formatNumber={formatNumber} 
          title="Main Inventory Formula"
          type="main"
        />
      )}

      {activeTab === "delivery" && (
        <StockFormula 
          summary={deliverySummary} 
          formatNumber={formatNumber} 
          title="Delivery Guys Stock Formula"
          type="delivery"
        />
      )}

      {/* Summary Cards */}
      {activeTab === "main" && (
        <StockSummaryCards summary={summary} formatNumber={formatNumber} />
      )}

      {/* Filters */}
      <StockFilters
        activeTab={activeTab}
        filters={filters}
        deliveryFilters={deliveryFilters}
        handleFilterChange={handleFilterChange}
        handleDeliveryFilterChange={handleDeliveryFilterChange}
        onRefresh={activeTab === "main" ? handleMainRefresh : handleDeliveryRefresh}
      />

      {/* Stock Table */}
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
});

StockDashboard.displayName = "StockDashboard";

export default StockDashboard;

