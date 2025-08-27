"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Card from "./ui/Card";

export default function ProductForm({ productId = null, onSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    expiryDate: "",
    rate: "",
    gstRate: "5",
    unit: "packet",
    companyId: "PRIMA-SM",
  });

  const [companies, setCompanies] = useState([
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);

  const [gstRates, setGstRates] = useState([
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
  ]);

  const [units, setUnits] = useState([
    { value: "packet", label: "Packet" },
    { value: "kg", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "liter", label: "Liter" },
    { value: "piece", label: "Piece" },
    { value: "dozen", label: "Dozen" },
    { value: "box", label: "Box" },
    { value: "bottle", label: "Bottle" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        const product = data.product;
        setFormData({
          name: product.name || "",
          expiryDate: product.expiryDate
            ? new Date(product.expiryDate).toISOString().split("T")[0]
            : "",
          rate: product.rate || "",
          gstRate: product.gstRate?.toString() || "5",
          unit: product.unit || "packet",
          companyId: product.companyId || "PRIMA-SM",
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product details");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push("Product name is required");
    }

    if (!formData.expiryDate) {
      errors.push("Expiry date is required");
    }

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      errors.push("Rate must be greater than 0");
    }

    if (!formData.gstRate) {
      errors.push("GST rate is required");
    }

    if (!formData.unit) {
      errors.push("Unit is required");
    }

    if (!formData.companyId) {
      errors.push("Company is required");
    }

    // Validate expiry date is not in the past
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
      errors.push("Expiry date cannot be in the past");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      setLoading(false);
      return;
    }

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rate: parseFloat(formData.rate),
          gstRate: parseInt(formData.gstRate),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (onSuccess) {
          onSuccess(result);
        } else {
          alert(
            productId
              ? "Product updated successfully!"
              : "Product created successfully!"
          );

          // Reset form for new product
          if (!productId) {
            setFormData({
              name: "",
              expiryDate: "",
              rate: "",
              gstRate: "5",
              unit: "packet",
              companyId: "PRIMA-SM",
            });
          } else {
            // Redirect to product detail page
            router.push(`/dashboard/products/${productId}`);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {productId ? "Edit Product" : "Add New Product"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                placeholder="Enter rate"
                required
              />
            </div>
          </div>

          {/* GST Rate and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate *
              </label>
              <Select
                options={gstRates}
                value={formData.gstRate}
                onChange={(value) => handleInputChange("gstRate", value)}
                placeholder="Select GST rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <Select
                options={units}
                value={formData.unit}
                onChange={(value) => handleInputChange("unit", value)}
                placeholder="Select unit"
              />
            </div>
          </div>

          {/* Company and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <Select
                options={companies}
                value={formData.companyId}
                onChange={(value) => handleInputChange("companyId", value)}
                placeholder="Select company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  handleInputChange("expiryDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              {loading
                ? "Saving..."
                : productId
                ? "Update Product"
                : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  name: "",
                  expiryDate: "",
                  rate: "",
                  gstRate: "5",
                  unit: "packet",
                  companyId: "PRIMA-SM",
                });
              }}
              className="px-6 py-3">
              Reset Form
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
