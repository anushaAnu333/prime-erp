"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

const CustomerForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched companies:", data.companies);
          console.log("Companies count:", data.companies?.length);
          setCompanies(data.companies || []);
        } else {
          console.error("Failed to fetch companies");
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

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
        companyId: formData.companyId || null,
      };

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess("Customer added successfully!");
        setFormData({
          name: "",
          address: "",
          shopName: "",
          phoneNumber: "",
          companyId: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add customer");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      setError("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add New Customer
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
                onChange={(value) => {
                  console.log("Selected company:", value);
                  handleInputChange("companyId", value);
                }}
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
              {loading ? "Adding..." : "Add Customer"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  name: "",
                  address: "",
                  shopName: "",
                  phoneNumber: "",
                  companyId: "",
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

export default CustomerForm;
