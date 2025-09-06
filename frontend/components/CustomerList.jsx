"use client";

import { useState, useEffect } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Card from "./ui/Card";
import Table from "./ui/Table";
import Link from "next/link";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    company: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
  }, [filters, pagination.page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.company && { company: filters.company }),
      });

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        const companyList = data.companies || [];
        console.log("Fetched companies for list:", companyList);
        setCompanies(companyList);
        setCompanyOptions([
          { value: "", label: "All Companies" },
          ...companyList.map((company) => ({
            value: company.companyCode,
            label: company.name,
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
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

  const columns = [
    {
      key: "customerCode",
      header: "Code",
      className: "w-20",
      render: (value, row) => (
        <Link
          href={`/dashboard/customers/${row._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          {value}
        </Link>
      ),
    },
    {
      key: "shopName",
      header: "Shop",
      className: "w-32",
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium truncate">{value}</div>
          <div className="text-gray-500 text-xs truncate">{row.name}</div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "Phone",
      className: "w-28",
      render: (value) => <span className="text-sm font-medium">{value}</span>,
    },
    {
      key: "address",
      header: "Address",
      render: (value) => (
        <span className="text-sm text-gray-600 max-w-32 truncate block">
          {value}
        </span>
      ),
    },
    {
      key: "currentBalance",
      header: "Balance",
      render: (value) => (
        <span
          className={`text-sm font-medium ${
            value > 0 ? "text-red-600" : "text-green-600"
          }`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-1">
          <Link href={`/dashboard/customers/${row._id}`}>
            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/customers/edit/${row._id}`}>
            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
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
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/customers/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search by name, shop name, or phone"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <Select
            options={companyOptions}
            value={filters.company}
            onChange={(value) => handleFilterChange("company", value)}
            placeholder="Filter by Company"
          />
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <Table
            data={customers}
            columns={columns}
            loading={loading}
            emptyMessage="No customers found"
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
