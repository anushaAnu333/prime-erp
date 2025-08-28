"use client";

import { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Table from "../ui/Table";
import Link from "next/link";

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
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([
    { value: "", label: "All Companies" },
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);
  const [filters, setFilters] = useState({
    customer: "",
    company: "",
    dateFrom: "",
    dateTo: "",
    paymentStatus: "",
    deliveryStatus: "",
    type: "Sale",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, [filters, pagination.page]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        type: filters.type,
        ...(filters.customer && { customer: filters.customer }),
        ...(filters.company && { company: filters.company }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.deliveryStatus && {
          deliveryStatus: filters.deliveryStatus,
        }),
      });

      const response = await fetch(`/api/sales?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        }));
      } else {
        const errorData = await response.json();
        console.error("Sales API error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers([
          { value: "", label: "All Customers" },
          ...(data.customers || []).map((customer) => ({
            value: customer.shopName,
            label: customer.shopName,
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
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
      header: filters.type === "Sale Return" ? "Return No" : "Invoice No",
      render: (value, row) => (
        <Link
          href={`/dashboard/sales/${row._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium">
          {value}
        </Link>
      ),
    },
    {
      key: "invoiceDate",
      header: "Date",
      render: (value) => formatDate(value),
    },
    {
      key: "customer",
      header: "Customer",
      render: (value, row) => {
        if (filters.type === "Sale Return" && row.originalSale) {
          return (
            <div className="text-sm">
              <div className="font-medium">{value.shopName}</div>
              <div className="text-gray-500 text-xs">
                Against: {row.originalSale.invoiceNumber}
              </div>
            </div>
          );
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{value.shopName}</div>
            <div className="text-gray-500 text-xs">{value.name}</div>
          </div>
        );
      },
    },
    {
      key: "items",
      header: "Products",
      render: (value, row) => {
        if (value && value.length > 0) {
          if (value.length === 1) {
            return (
              <div className="text-sm">
                <div className="font-medium">{value[0].product}</div>
                <div className="text-gray-500 text-xs">
                  Qty: {value[0].qty} × ₹{value[0].rate}
                </div>
              </div>
            );
          } else {
            return (
              <div className="text-sm">
                <div className="font-medium">{value.length} Products</div>
                <div className="text-gray-500 text-xs">
                  {value
                    .slice(0, 2)
                    .map((item) => `${item.product} (${item.qty})`)
                    .join(", ")}
                  {value.length > 2 && ` +${value.length - 2} more`}
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
      header: "Amount",
      render: (value) => formatCurrency(value),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (value) => getStatusBadge(value, "payment"),
    },
    {
      key: "deliveryStatus",
      header: "Delivery",
      render: (value) => getStatusBadge(value, "delivery"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/sales/${row._id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/sales/edit/${row._id}`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
        </div>
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

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <Table
            data={sales}
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
