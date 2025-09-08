"use client";

import React, { memo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const StockFilters = memo(({ 
  activeTab, 
  filters, 
  deliveryFilters, 
  handleFilterChange, 
  handleDeliveryFilterChange, 
  onRefresh 
}) => {
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

  if (activeTab === "main") {
    return (
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
          <Button onClick={onRefresh} size="sm">
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  return (
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
        <Button onClick={onRefresh} size="sm">
          Refresh
        </Button>
      </div>
    </Card>
  );
});

StockFilters.displayName = "StockFilters";

export default StockFilters;

