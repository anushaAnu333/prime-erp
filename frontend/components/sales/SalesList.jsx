"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Table from "../ui/Table";
import ActionButtons from "../ui/ActionButtons";
import Link from "next/link";
import {
  fetchSales,
  fetchCustomersForSales,
  setCurrentPage,
  setFilterField,
  selectSales,
  selectSalesLoading,
  selectSalesError,
  selectSalesPagination,
  selectSalesFilters,
  selectSalesCustomers,
  selectCustomersLoading,
} from "../../lib/store/slices/salesSlice";

// DateRangeFilter Component
const DateRangeFilter = ({ dateFrom, dateTo, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalDateFrom(dateFrom);
    setLocalDateTo(dateTo);
  }, [dateFrom, dateTo]);

  const handleApply = () => {
    onDateChange("dateFrom", localDateFrom);
    onDateChange("dateTo", localDateTo);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalDateFrom("");
    setLocalDateTo("");
    onDateChange("dateFrom", "");
    onDateChange("dateTo", "");
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (dateFrom && dateTo) {
      return `${dateFrom} to ${dateTo}`;
    } else if (dateFrom) {
      return `From ${dateFrom}`;
    } else if (dateTo) {
      return `To ${dateTo}`;
    }
    return "Date Range";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-left border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <div className="flex items-center justify-between">
          <span
            className={`${
              dateFrom || dateTo ? "text-gray-900" : "text-gray-500"
            } truncate text-sm`}>
            {getDisplayText()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={localDateFrom}
                  onChange={(e) => setLocalDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={localDateTo}
                  onChange={(e) => setLocalDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm">
                Apply
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 text-sm">
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SalesList() {
  // Redux state
  const dispatch = useDispatch();
  const sales = useSelector(selectSales);
  const loading = useSelector(selectSalesLoading);
  const error = useSelector(selectSalesError);
  const pagination = useSelector(selectSalesPagination);
  const filters = useSelector(selectSalesFilters);
  const customersData = useSelector(selectSalesCustomers);
  const customersLoading = useSelector(selectCustomersLoading);
  
  // Local state for companies (static data)
  const [companies] = useState([
    { value: "", label: "All Companies" },
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);
  
  // Transform customers data for select component
  const customers = [
    { value: "", label: "All Customers" },
    ...(customersData || []).map((customer) => ({
      value: customer.shopName,
      label: customer.shopName,
    })),
  ];

  useEffect(() => {
    // Fetch customers on component mount
    dispatch(fetchCustomersForSales());
  }, [dispatch]);
  
  useEffect(() => {
    // Fetch sales when filters or pagination change
    const params = {
      page: pagination.page,
      limit: 20,
      ...filters,
    };
    dispatch(fetchSales(params));
  }, [dispatch, filters, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    dispatch(setFilterField({ field, value }));
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status, type) => {
    // Handle null/undefined status values
    const displayStatus = status || "Pending";

    const statusColors = {
      payment: {
        Pending: "bg-yellow-100 text-yellow-800",
        Paid: "bg-green-100 text-green-800",
        Partial: "bg-blue-100 text-blue-800",
      },
      delivery: {
        Pending: "bg-yellow-100 text-yellow-800",
        Delivered: "bg-green-100 text-green-800",
        Cancelled: "bg-red-100 text-red-800",
      },
    };

    const colors = statusColors[type] || statusColors.payment;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[displayStatus] || "bg-gray-100 text-gray-800"
        }`}>
        {displayStatus}
      </span>
    );
  };

  const columns = [
    {
      key: "invoiceNumber",
      header: <span className="whitespace-nowrap">{filters.type === "Sale Return" ? "Return No" : "Invoice No"}</span>,
      render: (value, row) => (
        <Link
          href={`/dashboard/sales/${row?._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
          {value || 'N/A'}
        </Link>
      ),
    },
    {
      key: "invoiceDate",
      header: <span className="whitespace-nowrap">Date</span>,
      render: (value) => <span className="whitespace-nowrap">{value ? formatDate(value) : 'N/A'}</span>,
    },
    {
      key: "customer",
      header: <span className="whitespace-nowrap">Customer</span>,
      render: (value, row) => {
        if (filters.type === "Sale Return" && row?.originalSale) {
          return (
            <div className="text-sm min-w-0">
              <div className="font-medium truncate">{value?.shopName || 'N/A'}</div>
              <div className="text-gray-500 text-xs truncate">
                Against: {row.originalSale?.invoiceNumber || 'N/A'}
              </div>
            </div>
          );
        }
        return (
          <div className="text-sm min-w-0">
            <div className="font-medium truncate">{value?.shopName || 'N/A'}</div>
            <div className="text-gray-500 text-xs truncate">{value?.name || 'N/A'}</div>
          </div>
        );
      },
    },
    {
      key: "items",
      header: <span className="whitespace-nowrap">Products</span>,
      render: (value, row) => {
        if (value && value.length > 0) {
          if (value.length === 1) {
            return (
              <div className="text-sm min-w-0">
                <div className="font-medium truncate">{value[0].product}</div>
                <div className="text-gray-500 text-xs truncate">
                  HSN: {value[0].hsnCode || 'N/A'} | Qty: {value[0].qty} × ₹{value[0].rate}
                </div>
              </div>
            );
          } else {
            return (
              <div className="text-sm min-w-0 max-w-xs">
                <div className="font-medium mb-1">{value.length} Products</div>
                <div className="space-y-1">
                  {value.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-gray-500 text-xs">
                      <div className="truncate font-medium">{item.product}</div>
                      <div className="text-gray-400">
                        HSN: {item.hsnCode || 'N/A'} • Qty: {item.qty}
                      </div>
                    </div>
                  ))}
                  {value.length > 2 && (
                    <div className="text-gray-400 text-xs font-medium">
                      +{value.length - 2} more items
                    </div>
                  )}
                </div>
              </div>
            );
          }
        }
        return "N/A";
      },
    },
    {
      key: "finalAmount",
      header: <span className="whitespace-nowrap">Amount</span>,
      render: (value) => <span className="whitespace-nowrap">{value ? formatCurrency(value) : 'N/A'}</span>,
    },
    {
      key: "paymentStatus",
      header: <span className="whitespace-nowrap">Payment</span>,
      render: (value) => getStatusBadge(value, "payment"),
    },
    {
      key: "deliveryStatus",
      header: <span className="whitespace-nowrap">Delivery</span>,
      render: (value) => getStatusBadge(value, "delivery"),
    },
    {
      key: "actions",
      header: <span className="whitespace-nowrap">Actions</span>,
      render: (_, row) => (
        <ActionButtons
          viewHref={`/dashboard/sales/${row?._id}`}
          editHref={`/dashboard/sales/edit/${row?._id}`}
          showDelete={false}
          size="sm"
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {filters.type === "Sale" ? "Sales Invoices" : "Sales Returns"}
          </h2>
          <div className="flex gap-2">
            <Link href="/dashboard/sales/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Sales Invoice
              </Button>
            </Link>
            <Link href="/dashboard/sales/returns/create">
              <Button className="bg-red-600 hover:bg-red-700">
                Create Sales Return
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-7 gap-4 mb-6">
          <Select
            placeholder="Select Customer"
            options={customers}
            value={filters.customer}
            onChange={(value) => handleFilterChange("customer", value)}
          />
          <Select
            placeholder="Select Company"
            options={companies}
            value={filters.company}
            onChange={(value) => handleFilterChange("company", value)}
          />
          <DateRangeFilter
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateChange={(field, value) => handleFilterChange(field, value)}
          />
          <Select
            placeholder="Payment"
            options={[
              { value: "", label: "All Payments" },
              { value: "Pending", label: "Pending" },
              { value: "Paid", label: "Paid" },
              { value: "Partial", label: "Partial" },
            ]}
            value={filters.paymentStatus}
            onChange={(value) => handleFilterChange("paymentStatus", value)}
          />
          <Select
            placeholder="Delivery"
            options={[
              { value: "", label: "All Deliveries" },
              { value: "Pending", label: "Pending" },
              { value: "Delivered", label: "Delivered" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            value={filters.deliveryStatus}
            onChange={(value) => handleFilterChange("deliveryStatus", value)}
          />
          <Select
            options={[
              { value: "Sale", label: "Sales" },
              { value: "Sale Return", label: "Returns" },
            ]}
            value={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <Table
            data={sales || []}
            columns={columns}
            loading={loading}
            emptyMessage={
              filters.type === "Sale"
                ? "No sales invoices found"
                : "No sales returns found"
            }
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
