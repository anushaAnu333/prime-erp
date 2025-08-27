"use client";

import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import Table from "../../../components/ui/Table";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
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
    fetchProducts();
    fetchCompanies();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
        ...(filters.company && { company: filters.company }),
      });

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
      key: "productCode",
      header: "Code",
      className: "w-24",
      render: (value, row) => (
        <Link
          href={`/dashboard/products/${row._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm">
          {value}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Product",
      className: "w-32",
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium truncate">{value}</div>
          <div className="text-gray-500 text-xs truncate">{row.unit}</div>
        </div>
      ),
    },
    {
      key: "rate",
      header: "Rate",
      className: "w-20",
      render: (value) => (
        <span className="text-sm font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "gstRate",
      header: "GST %",
      className: "w-16",
      render: (value) => (
        <span className="text-sm text-gray-600">{value}%</span>
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      className: "w-24",
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
    {
      key: "companyId",
      header: "Company",
      className: "w-28",
      render: (value, row) => {
        const company = companies.find((c) => c.companyCode === value);
        return (
          <span className="text-sm text-gray-600 truncate">
            {company ? company.name : "Unknown"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (_, row) => (
        <div className="flex gap-1">
          <Link href={`/dashboard/products/${row._id}`}>
            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/products/edit/${row._id}`}>
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
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/products/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search by product name or code"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <Select
            placeholder="Filter by Company"
            options={companyOptions}
            value={filters.company}
            onChange={(value) => handleFilterChange("company", value)}
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <Table
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="No products found"
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
