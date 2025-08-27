"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function EditStock() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stock, setStock] = useState(null);
  const [formData, setFormData] = useState({
    openingStock: "",
    minimumStock: "",
    expiryDate: "",
    unit: "",
  });

  const unitOptions = [
    { value: "packets", label: "Packets" },
    { value: "packs", label: "Packs" },
    { value: "kg", label: "Kilograms (kg)" },
  ];

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await fetch(`/api/stock/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setStock(data.stock);
        setFormData({
          openingStock: data.stock.openingStock.toString(),
          minimumStock: data.stock.minimumStock.toString(),
          expiryDate: data.stock.expiryDate.split("T")[0],
          unit: data.stock.unit,
        });
      } else {
        setError("Failed to fetch stock data");
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.openingStock || formData.openingStock <= 0) {
      setError("Opening stock must be greater than 0");
      return false;
    }
    if (!formData.minimumStock || formData.minimumStock < 0) {
      setError("Minimum stock must be 0 or greater");
      return false;
    }
    if (!formData.expiryDate) {
      setError("Please select an expiry date");
      return false;
    }
    if (!formData.unit) {
      setError("Please select a unit");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/stock/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockId: params.id,
          openingStock: parseInt(formData.openingStock),
          minimumStock: parseInt(formData.minimumStock),
          expiryDate: formData.expiryDate,
          unit: formData.unit,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Stock updated successfully!");
        router.push("/dashboard/stock");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      setError("Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/stock");
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Stock Not Found</h2>
            <p className="text-gray-600 mb-4">The requested stock could not be found.</p>
            <Button onClick={() => router.push("/dashboard/stock")}>
              Back to Stock Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Stock</h1>
        <p className="text-gray-600">
          Update stock details for {stock.product} ({stock.companyId})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Stock Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Product Info (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <Input
                value={stock.product}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Company Info (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <Input
                value={stock.companyId}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Opening Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Stock *
              </label>
              <Input
                type="number"
                min="0"
                value={formData.openingStock}
                onChange={(e) => handleInputChange("openingStock", e.target.value)}
                placeholder="Enter opening stock quantity"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <Select
                options={unitOptions}
                value={formData.unit}
                onChange={(value) => handleInputChange("unit", value)}
                placeholder="Select unit of measurement"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              />
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <Input
                type="number"
                min="0"
                value={formData.minimumStock}
                onChange={(e) => handleInputChange("minimumStock", e.target.value)}
                placeholder="Enter minimum stock level"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Updating..." : "Update Stock"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Stock Overview - Matching Your Spreadsheet Format */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Overview</h2>
          
          {/* Stock Formula Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Stock Formula</h3>
            <div className="text-sm text-blue-700">
              <p>Opening Stock + Purchases - Sales = Closing Stock</p>
              <p className="mt-1 font-mono">
                {formatNumber(stock.openingStock)} + {formatNumber(stock.totalPurchases)} - {formatNumber(stock.totalSales)} = {formatNumber(stock.closingStock)} {stock.unit}
              </p>
            </div>
          </div>

          {/* Current Stock Status */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Opening Stock:</span>
              <span className="font-mono">{formatNumber(stock.openingStock)} {stock.unit}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Purchases:</span>
              <span className="font-mono text-green-600">+{formatNumber(stock.totalPurchases)} {stock.unit}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Total Sales:</span>
              <span className="font-mono text-red-600">-{formatNumber(stock.totalSales)} {stock.unit}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-2 border-blue-300">
              <span className="font-bold">Closing Stock:</span>
              <span className="font-mono font-bold text-blue-800">{formatNumber(stock.closingStock)} {stock.unit}</span>
            </div>
          </div>

          {/* Agent Stock Allocation */}
          {stock.agentStocks && stock.agentStocks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Agent Stock Allocation</h3>
              <div className="space-y-2">
                {stock.agentStocks.map((agent, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{agent.agentName}</span>
                      <span className="text-sm text-gray-500">Agent {index + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Allocated:</span>
                        <span className="font-mono ml-1">{formatNumber(agent.stockAllocated)} {stock.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-mono ml-1">{formatNumber(agent.stockDelivered)} {stock.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">In Hand:</span>
                        <span className="font-mono ml-1">{formatNumber(agent.stockInHand)} {stock.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Alerts */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Stock Status</h3>
            <div className="space-y-2">
              {stock.isLowStock && (
                <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                  ⚠️ Low Stock Alert: Stock is below minimum level
                </div>
              )}
              {stock.isExpired && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded">
                  🚨 Expired Stock: Product has expired
                </div>
              )}
              {!stock.isLowStock && !stock.isExpired && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-800 rounded">
                  ✅ Stock Status: Normal
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

