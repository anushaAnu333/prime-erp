"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { createCustomer, clearError } from "@/lib/store/slices/customersSlice";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const CustomerForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.customers);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    shopName: "",
    phoneNumber: "",
    email: "",
    currentBalance: 0,
  });


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccess("");

    const payload = {
      ...formData,
      currentBalance: parseFloat(formData.currentBalance) || 0,
    };

    try {
      const result = await dispatch(createCustomer(payload)).unwrap();
      setSuccess("Customer added successfully!");
      setFormData({
        name: "",
        address: "",
        shopName: "",
        phoneNumber: "",
        email: "",
        currentBalance: 0,
      });
    } catch (error) {
      console.error("Error adding customer:", error);
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
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentBalance}
                onChange={(e) =>
                  handleInputChange("currentBalance", e.target.value)
                }
                placeholder="Enter current balance"
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
                  email: "",
                  currentBalance: 0,
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
