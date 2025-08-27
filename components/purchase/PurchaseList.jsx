"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Table from "../ui/Table";
import Link from "next/link";

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([
    { value: "", label: "All Companies" },
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);
  const [filters, setFilters] = useState({
    vendor: "",
    company: "",
    dateFrom: "",
    dateTo: "",
    type: "Purchase",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchVendors();
  }, [filters, pagination.page]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        type: filters.type,
        ...(filters.vendor && { vendor: filters.vendor }),
        ...(filters.company && { company: filters.company }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/purchases?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/vendors");
      if (response.ok) {
        const data = await response.json();
        setVendors([
          { value: "", label: "All Vendors" },
          ...data?.map((vendor) => ({
            value: vendor.vendorName,
            label: vendor.vendorName,
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
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

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Received: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Returned: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "purchaseNumber",
      header: filters.type === "Purchase Return" ? "Return No" : "Purchase No",
      render: (value, row) => (
        <Link
          href={`/dashboard/purchases/${row._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium">
          {value}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (value) => formatDate(value),
    },
    {
      key: "vendorName",
      header: "Vendor",
      render: (value, row) => {
        if (filters.type === "Purchase Return" && row.originalPurchase) {
          return (
            <div className="text-sm">
              <div className="font-medium">{value}</div>
              <div className="text-gray-500 text-xs">
                Against: {row.originalPurchase.purchaseNumber}
              </div>
            </div>
          );
        }
        return value;
      },
    },
    {
      key: "supplierInvoiceNumber",
      header: "Supplier Invoice",
      render: (value, row) => {
        if (filters.type === "Purchase Return") {
          // For returns, show original purchase info instead
          if (row.originalPurchase) {
            return (
              <div className="text-sm">
                <div className="font-medium text-gray-600">
                  Original Purchase
                </div>
                <div className="text-gray-500 text-xs">
                  {formatDate(row.originalPurchase.date)}
                </div>
              </div>
            );
          }
          return "N/A";
        } else {
          // For purchases, show supplier invoice info
          if (row.supplierInvoiceNumber) {
            return (
              <div className="text-sm">
                <div className="font-medium">{row.supplierInvoiceNumber}</div>
                <div className="text-gray-500 text-xs">
                  {row.supplierInvoiceDate
                    ? formatDate(row.supplierInvoiceDate)
                    : ""}
                </div>
              </div>
            );
          }
          return "N/A";
        }
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
      key: "total",
      header: "Amount",
      render: (value) => formatCurrency(value),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => {
        const statusBadge = getStatusBadge(value);

        // Check if this purchase has any returns
        const hasReturns = row.hasReturns || false;

        return (
          <div className="space-y-1">
            {statusBadge}
            {hasReturns && (
              <div className="text-xs text-red-600 font-medium">
                Has Returns
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/purchases/${row._id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/purchases/edit/${row._id}`}>
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
            {filters.type === "Purchase"
              ? "Purchase Invoices"
              : "Purchase Returns"}
          </h2>
          <div className="flex gap-2">
            <Link href="/dashboard/purchases/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                New Purchase
              </Button>
            </Link>
            <Link href="/dashboard/purchases/returns/create">
              <Button className="bg-red-600 hover:bg-red-700">
                New Return
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Select
            placeholder="Select Vendor"
            options={vendors}
            value={filters.vendor}
            onChange={(value) => handleFilterChange("vendor", value)}
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
            options={[
              { value: "Purchase", label: "Purchases" },
              { value: "Purchase Return", label: "Returns" },
            ]}
            value={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
          />
        </div>

        {/* Purchase Table */}
        <div className="overflow-x-auto">
          <Table
            data={purchases}
            columns={columns}
            loading={loading}
            emptyMessage="No purchases found"
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
