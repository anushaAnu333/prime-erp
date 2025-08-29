"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";

export default function VendorForm({ vendorId = null, onSuccess }) {
  const [formData, setFormData] = useState({
    vendorName: "",
    contactPerson: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
    paymentTerms: "30 days",
    companyId: "PRIMA-SM",
  });

  const [companies, setCompanies] = useState([
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);

  const [paymentTerms, setPaymentTerms] = useState([
    { value: "Cash", label: "Cash" },
    { value: "7 days", label: "7 days" },
    { value: "15 days", label: "15 days" },
    { value: "30 days", label: "30 days" },
    { value: "45 days", label: "45 days" },
    { value: "60 days", label: "60 days" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`);
      if (response.ok) {
        const vendor = await response.json();
        setFormData({
          vendorName: vendor.vendorName || "",
          contactPerson: vendor.contactPerson || "",
          address: vendor.address || "",
          phone: vendor.phone || "",
          email: vendor.email || "",
          gstNumber: vendor.gstNumber || "",
          paymentTerms: vendor.paymentTerms || "30 days",
          companyId: vendor.companyId || "PRIMA-SM",
        });
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
      setError("Failed to fetch vendor details");
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

    if (!formData.vendorName.trim()) {
      errors.push("Vendor name is required");
    }

    if (!formData.contactPerson.trim()) {
      errors.push("Contact person is required");
    }

    if (!formData.address.trim()) {
      errors.push("Address is required");
    }

    if (!formData.phone.trim()) {
      errors.push("Phone number is required");
    }

    if (!formData.gstNumber.trim()) {
      errors.push("GST number is required");
    }

    // Validate GST number format
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (
      formData.gstNumber &&
      !gstRegex.test(formData.gstNumber.toUpperCase())
    ) {
      errors.push("Please enter a valid GST number");
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address");
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
      const url = vendorId ? `/api/vendors/${vendorId}` : "/api/vendors";
      const method = vendorId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gstNumber: formData.gstNumber.toUpperCase(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          vendorId
            ? "Vendor updated successfully!"
            : "Vendor created successfully!"
        );

        if (onSuccess) {
          onSuccess(result);
        } else {
          // Reset form for new vendor
          setFormData({
            vendorName: "",
            contactPerson: "",
            address: "",
            phone: "",
            email: "",
            gstNumber: "",
            paymentTerms: "30 days",
            companyId: "PRIMA-SM",
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save vendor");
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
      setError("Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {vendorId ? "Edit Vendor" : "Add New Vendor"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <Input
                value={formData.vendorName}
                onChange={(e) =>
                  handleInputChange("vendorName", e.target.value)
                }
                placeholder="Enter vendor company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <Input
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                placeholder="Enter contact person name"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* GST and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <Input
                value={formData.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="Enter GST number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <Select
                options={companies}
                value={formData.companyId}
                onChange={(value) => handleInputChange("companyId", value)}
                required
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <Select
                options={paymentTerms}
                value={formData.paymentTerms}
                onChange={(value) => handleInputChange("paymentTerms", value)}
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
                : vendorId
                ? "Update Vendor"
                : "Create Vendor"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  vendorName: "",
                  contactPerson: "",
                  address: "",
                  phone: "",
                  email: "",
                  gstNumber: "",
                  paymentTerms: "30 days",
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
