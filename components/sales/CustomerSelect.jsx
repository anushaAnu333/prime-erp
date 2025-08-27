"use client";

import { useState, useEffect } from "react";
import Select from "@/components/ui/Select";

const CustomerSelect = ({
  value,
  onCustomerSelect,
  error = false,
  disabled = false,
  className = "",
}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers
  const fetchCustomers = async (search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const url = `/api/customers?${params}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      } else {
        console.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search
  const handleSearch = (search) => {
    fetchCustomers(search);
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    if (customerId && onCustomerSelect && typeof onCustomerSelect === "function") {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      if (selectedCustomer) {
        onCustomerSelect(selectedCustomer);
      }
    }
  };

  // Format options for select
  const options = customers.map((customer) => ({
    value: customer.id,
    label: customer.displayName,
    customer: customer,
  }));

  return (
    <div className={className}>
      <Select
        options={options}
        value={value}
        onChange={handleCustomerChange}
        placeholder="Select a customer"
        searchable={true}
        loading={loading}
        disabled={disabled}
        error={error}
        onSearch={handleSearch}
        displayKey="label"
        valueKey="value"
      />
      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          {(() => {
            const selectedCustomer = customers.find((c) => c.id === value);
            if (!selectedCustomer) return null;

            return (
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {selectedCustomer.shopName}
                </div>
                <div className="text-gray-600">
                  {selectedCustomer.name} • {selectedCustomer.phoneNumber}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {selectedCustomer.address}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Balance: ₹
                  {selectedCustomer.currentBalance?.toFixed(2) || "0.00"}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CustomerSelect;
