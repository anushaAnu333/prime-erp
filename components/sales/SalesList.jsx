"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Table from "../ui/Table";
import Link from "next/link";

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
        setSales(data.sales);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
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
          colors[status] || "bg-gray-100 text-gray-800"
        }`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice No",
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
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">{value.shopName}</div>
          <div className="text-gray-500 text-xs">{value.name}</div>
        </div>
      ),
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
          <h2 className="text-2xl font-bold text-gray-800">Sales Invoices</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/sales/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          />
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          />
          <Select
            placeholder="Payment Status"
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
            placeholder="Delivery Status"
            options={[
              { value: "", label: "All Deliveries" },
              { value: "Pending", label: "Pending" },
              { value: "Delivered", label: "Delivered" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            value={filters.deliveryStatus}
            onChange={(value) => handleFilterChange("deliveryStatus", value)}
          />
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <Table
            data={sales}
            columns={columns}
            loading={loading}
            emptyMessage="No sales invoices found"
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
