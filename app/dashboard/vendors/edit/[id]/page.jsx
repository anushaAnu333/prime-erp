"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import Card from "../../../../../components/ui/Card";
import Link from "next/link";

export default function EditVendorPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    vendorName: "",
    contactPerson: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
    paymentTerms: "30 days",
  });


  const [paymentTerms, setPaymentTerms] = useState([
    { value: "Cash", label: "Cash" },
    { value: "7 days", label: "7 days" },
    { value: "15 days", label: "15 days" },
    { value: "30 days", label: "30 days" },
    { value: "45 days", label: "45 days" },
    { value: "60 days", label: "60 days" },
  ]);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          vendorName: data.vendor.vendorName || "",
          contactPerson: data.vendor.contactPerson || "",
          address: data.vendor.address || "",
          phone: data.vendor.phone || "",
          email: data.vendor.email || "",
          gstNumber: data.vendor.gstNumber || "",
          paymentTerms: data.vendor.paymentTerms || "30 days",
        });
      } else {
        setError("Vendor not found");
      }
    } catch (error) {
      setError("Failed to fetch vendor details");
    } finally {
      setFetching(false);
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
    setSuccess("");

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gstNumber: formData.gstNumber.toUpperCase(),
        }),
      });

      if (response.ok) {
        setSuccess("Vendor updated successfully!");
        setTimeout(() => {
          router.push(`/dashboard/vendors/${id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update vendor");
      }
    } catch (error) {
      setError("Failed to update vendor");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !formData.vendorName) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/vendors">
              <Button variant="outline">Back to Vendors</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Vendor</h2>
          <Link href={`/dashboard/vendors/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

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
          {/* Vendor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
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
                Contact Person *
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
                Address *
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
                Phone Number *
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

          {/* GST Number */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number *
              </label>
              <Input
                value={formData.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="Enter GST number"
                required
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms *
              </label>
              <Select
                options={paymentTerms}
                value={formData.paymentTerms}
                onChange={(value) => handleInputChange("paymentTerms", value)}
                placeholder="Select payment terms"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              {loading ? "Updating..." : "Update Vendor"}
            </Button>
            <Link href={`/dashboard/vendors/${id}`}>
              <Button type="button" variant="secondary" className="px-6 py-3">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
