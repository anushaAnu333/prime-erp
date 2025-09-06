"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { createStock } from "@/lib/store/slices/stockSlice";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function CreateStock() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    product: "",
    companyId: "",
    openingStock: "",
    unit: "",
    expiryDate: "",
    minimumStock: "",
  });

  const productOptions = [
    { value: "dosa", label: "Dosa" },
    { value: "idli", label: "Idli" },
    { value: "chapati", label: "Chapati" },
    { value: "parata", label: "Parata" },
    { value: "paneer", label: "Paneer" },
    { value: "green peas", label: "Green Peas" },
  ];

  const companyOptions = [
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Foodtech" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ];

  const unitOptions = [
    { value: "packets", label: "Packets" },
    { value: "packs", label: "Packs" },
    { value: "kg", label: "Kilograms (kg)" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.product) {
      setError("Please select a product");
      return false;
    }
    if (!formData.companyId) {
      setError("Please select a company");
      return false;
    }
    if (!formData.openingStock || formData.openingStock <= 0) {
      setError("Opening stock must be greater than 0");
      return false;
    }
    if (!formData.unit) {
      setError("Please select a unit");
      return false;
    }
    if (!formData.expiryDate) {
      setError("Please select an expiry date");
      return false;
    }
    if (!formData.minimumStock || formData.minimumStock < 0) {
      setError("Minimum stock must be 0 or greater");
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

    setLoading(true);

    try {
      const stockData = {
        product: formData.product,
        companyId: formData.companyId,
        openingStock: parseInt(formData.openingStock),
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        minimumStock: parseInt(formData.minimumStock) || 10,
      };

      await dispatch(createStock(stockData)).unwrap();
      alert("Stock created successfully!");
      router.push("/dashboard/stock");
    } catch (error) {
      console.error("Error creating stock:", error);
      setError(error || "Failed to create stock");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/stock");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Stock</h1>
        <p className="text-gray-600">
          Create a new stock entry for product inventory tracking
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product *
            </label>
            <Select
              options={productOptions}
              value={formData.product}
              onChange={(value) => handleInputChange("product", value)}
              placeholder="Select a product"
            />
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <Select
              options={companyOptions}
              value={formData.companyId}
              onChange={(value) => handleInputChange("companyId", value)}
              placeholder="Select a company"
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
              onChange={(e) =>
                handleInputChange("openingStock", e.target.value)
              }
              placeholder="Enter opening stock quantity"
            />
            <p className="text-sm text-gray-500 mt-1">
              Initial stock quantity available
            </p>
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
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-sm text-gray-500 mt-1">
              Date when the product expires
            </p>
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
              onChange={(e) =>
                handleInputChange("minimumStock", e.target.value)
              }
              placeholder="Enter minimum stock level (default: 10)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Alert will be triggered when stock falls below this level
            </p>
          </div>

          {/* Stock Formula Preview */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Stock Formula Preview
            </h3>
            <div className="text-sm text-blue-700">
              <p>Opening Stock + Purchases - Sales = Closing Stock</p>
              <p className="mt-1">
                {formData.openingStock || 0} + 0 - 0 ={" "}
                {formData.openingStock || 0} {formData.unit}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Stock"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

