"use client";

import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";
import Table from "../../../components/ui/Table";
import Link from "next/link";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [filters]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/vendors?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const columns = [
    {
      key: "vendorCode",
      header: "Vendor Code",
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "vendorName",
      header: "Vendor Name",
    },
    {
      key: "contactPerson",
      header: "Contact Person",
    },
    {
      key: "phone",
      header: "Phone",
    },
  
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/vendors/${row._id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/vendors/edit/${row._id}`}>
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
          <h2 className="text-2xl font-bold text-gray-800">Vendors</h2>
          <Link href="/dashboard/vendors/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add New Vendor
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search vendors..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <Table
            data={vendors}
            columns={columns}
            loading={loading}
            emptyMessage="No vendors found"
          />
        </div>
      </Card>
    </div>
  );
}
