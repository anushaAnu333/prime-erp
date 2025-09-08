"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function CreateDeliveryStock() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveryGuyId: "",
    deliveryGuyName: "",
    product: "",
    companyId: "",
    unit: "",
    openingStock: 0,
    stockReceived: 0,
    stockDelivered: 0,
    stockReturned: 0,
    status: "Active"
  });

  const deliveryGuyOptions = [
    { value: "DG001", label: "Rajesh Kumar (DG001)" },
    { value: "DG002", label: "Suresh Singh (DG002)" },
    { value: "DG003", label: "Amit Sharma (DG003)" },
    { value: "DG004", label: "Vikram Patel (DG004)" },
  ];

  const companyOptions = [
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Foodtech" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ];

  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "l", label: "Liters (l)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "boxes", label: "Boxes" },
    { value: "bags", label: "Bags" },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryGuyChange = (value) => {
    const selectedGuy = deliveryGuyOptions.find(option => option.value === value);
    setFormData(prev => ({
      ...prev,
      deliveryGuyId: value,
      deliveryGuyName: selectedGuy ? selectedGuy.label.split(' (')[0] : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stock/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/stock');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating delivery stock:', error);
      alert('Error creating delivery stock entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Add Delivery Stock Entry
        </h1>
        <p className="text-gray-600">
          Track stock allocation and movement for delivery personnel
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Guy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Guy *
              </label>
              <Select
                options={deliveryGuyOptions}
                value={formData.deliveryGuyId}
                onChange={handleDeliveryGuyChange}
                placeholder="Select delivery guy"
                required
              />
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <Input
                type="text"
                value={formData.product}
                onChange={(e) => handleInputChange("product", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <Select
                options={companyOptions}
                value={formData.companyId}
                onChange={(value) => handleInputChange("companyId", value)}
                placeholder="Select company"
                required
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
                placeholder="Select unit"
                required
              />
            </div>

            {/* Opening Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Stock
              </label>
              <Input
                type="number"
                value={formData.openingStock}
                onChange={(e) => handleInputChange("openingStock", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Received */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Received
              </label>
              <Input
                type="number"
                value={formData.stockReceived}
                onChange={(e) => handleInputChange("stockReceived", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Delivered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Delivered
              </label>
              <Input
                type="number"
                value={formData.stockDelivered}
                onChange={(e) => handleInputChange("stockDelivered", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Returned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Returned
              </label>
              <Input
                type="number"
                value={formData.stockReturned}
                onChange={(e) => handleInputChange("stockReturned", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Stock Formula Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Stock Calculation
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Closing Stock =</span> Opening Stock + Stock Received - Stock Delivered - Stock Returned
              </p>
              <p className="mt-2">
                <span className="font-medium">Closing Stock =</span> {formData.openingStock} + {formData.stockReceived} - {formData.stockDelivered} - {formData.stockReturned} = <span className="font-bold text-blue-600">{formData.openingStock + formData.stockReceived - formData.stockDelivered - formData.stockReturned}</span>
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Delivery Stock Entry"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}



