"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select from "@/components/ui/Select";
import {
  fetchCustomersForSales,
  selectSalesCustomers,
  selectCustomersLoading,
} from "@/lib/store/slices/salesSlice";

const CustomerSelect = ({
  value,
  onCustomerSelect,
  error = false,
  disabled = false,
  className = "",
}) => {
  const dispatch = useDispatch();
  const customers = useSelector(selectSalesCustomers);
  const loading = useSelector(selectCustomersLoading);

  // Initial fetch
  useEffect(() => {
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomersForSales());
    }
  }, [dispatch, customers]);

  // Handle search - for now, we'll use the existing customers
  // TODO: Implement search functionality in Redux slice
  const handleSearch = (search) => {
    // For now, just dispatch the fetch action
    // In the future, we can add search parameters to the Redux slice
    dispatch(fetchCustomersForSales());
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    if (
      customerId &&
      onCustomerSelect &&
      typeof onCustomerSelect === "function"
    ) {
      const selectedCustomer = (customers || []).find((c) => c._id === customerId);
      if (selectedCustomer) {
        onCustomerSelect(selectedCustomer);
      }
    }
  };

  // Format options for select
  const options = (customers || []).map((customer) => ({
    value: customer._id, // Use _id instead of id
    label: `${customer.shopName} - ${customer.name}`, // Use shopName and name
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
            const selectedCustomer = (customers || []).find((c) => c._id === value);
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
