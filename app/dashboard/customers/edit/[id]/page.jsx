"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import Card from "../../../../../components/ui/Card";
import Link from "next/link";

export default function EditCustomerPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    shopName: "",
    phoneNumber: "",
    companyId: "",
  });

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetchCustomer();
    fetchCompanies();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.customer.name,
          address: data.customer.address,
          shopName: data.customer.shopName,
          phoneNumber: data.customer.phoneNumber,
          companyId: data.customer.companyId || "",
        });
      } else {
        setError("Customer not found");
      }
    } catch (error) {
      setError("Failed to fetch customer details");
    } finally {
      setFetching(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
      }
    } catch (error) {
    } finally {
      setLoadingCompanies(false);
    }
  };

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
        companyId: formData.companyId || null,
      };

      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess("Customer updated successfully!");
        setTimeout(() => {
          router.push(`/dashboard/customers/${id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update customer");
      }
    } catch (error) {
      setError("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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

  if (error && !formData.name) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/customers">
              <Button variant="outline">Back to Customers</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Customer</h2>
          <Link href={`/dashboard/customers/${id}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name *
              </label>
              <Input
                type="text"
                value={formData.shopName}
                onChange={(e) => handleInputChange("shopName", e.target.value)}
                placeholder="Enter shop name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Assignment (Optional)
              </label>
              <Select
                options={[
                  {
                    value: "",
                    label: loadingCompanies
                      ? "Loading companies..."
                      : "Select company (optional)",
                  },
                  ...companies.map((company) => ({
                    value: company.companyCode,
                    label: `${company.name} - ${company.companyCode}`,
                  })),
                ]}
                value={formData.companyId}
                onChange={(value) => handleInputChange("companyId", value)}
                disabled={loadingCompanies}
                placeholder="Select company (optional)"
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

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              {loading ? "Updating..." : "Update Customer"}
            </Button>
            <Link href={`/dashboard/customers/${id}`}>
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
