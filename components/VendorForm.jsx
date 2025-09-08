"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

const VendorForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        currentBalance: 0,
      };

      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess("Vendor added successfully!");
        setFormData({
          vendorCode: "",
          vendorName: "",
          contactPerson: "",
          address: "",
          phone: "",
          email: "",
          gstNumber: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add vendor");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      setError("Failed to add vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add New Vendor
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Code *
              </label>
              <Input
                type="text"
                value={formData.vendorCode}
                onChange={(e) =>
                  handleInputChange("vendorCode", e.target.value)
                }
                placeholder="Enter vendor code"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <Input
                type="text"
                value={formData.vendorName}
                onChange={(e) =>
                  handleInputChange("vendorName", e.target.value)
                }
                placeholder="Enter vendor name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <Input
                type="text"
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                placeholder="Enter contact person name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter complete address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number *
              </label>
              <Input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="Enter GST number"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              {loading ? "Adding..." : "Add Vendor"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  vendorCode: "",
                  vendorName: "",
                  contactPerson: "",
                  address: "",
                  phone: "",
                  email: "",
                  gstNumber: "",
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
};

export default VendorForm;
