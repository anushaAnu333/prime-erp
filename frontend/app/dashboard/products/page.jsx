"use client";

import { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";
import Table, { ActionIcons } from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import { useModal } from "../../../hooks/useModal";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const { modalState, showSuccess, showError, showConfirm, hideModal } =
    useModal();

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "20",
        ...(filters.search && { search: filters.search }),
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
      showError("Failed to fetch products");
    } finally {
      setLoading(false);
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

  const handleDelete = async (productId, productName) => {
    showConfirm(
      `Are you sure you want to delete "${productName}"?`,
      "Confirm Delete",
      async () => {
        try {
          const response = await fetch(`/api/products/${productId}`, {
            method: "DELETE",
          });
          if (response.ok) {
            showSuccess(`Product "${productName}" deleted successfully`);
            fetchProducts();
          } else {
            showError("Failed to delete product");
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          showError("Failed to delete product");
        }
      }
    );
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
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium truncate">{value}</div>
        </div>
      ),
    },
    {
      key: "hsnCode",
      header: "HSN Code",
      className: "w-24",
      render: (value) => (
        <span className="text-sm font-medium text-gray-700">{value}</span>
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
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (_, row) => (
        <ActionIcons
          viewPath={`/dashboard/products/${row._id}`}
          editPath={`/dashboard/products/edit/${row._id}`}
          onDelete={() => handleDelete(row._id, row.name)}
          deleteConfirmMessage={`Are you sure you want to delete "${row.name}"?`}
          showView={true}
          showEdit={true}
          showDelete={true}
          size="sm"
        />
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
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by product name, code, or HSN code"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
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

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancelButton={modalState.showCancelButton}
        size={modalState.size}
      />
    </div>
  );
}
