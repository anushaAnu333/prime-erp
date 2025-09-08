"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Card from "../../../components/ui/Card";
import Table, { ActionIcons } from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import { useModal } from "../../../hooks/useModal";
import { useDebounce } from "../../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../../lib/hooks";
import { 
  fetchProducts, 
  deleteProduct,
  optimisticDeleteProduct,
  revertOptimisticUpdate,
  selectProducts, 
  selectProductsLoading, 
  selectProductsError, 
  selectProductsPagination,
  selectOptimisticUpdates
} from "../../../lib/store/slices/productsSlice";
import Link from "next/link";

// Memoized ActionIcons component for better performance
const MemoizedActionIcons = memo(ActionIcons);

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const pagination = useAppSelector(selectProductsPagination);
  const optimisticUpdates = useAppSelector(selectOptimisticUpdates);
  
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchInput, 300); // 300ms debounce
  
  const { modalState, showSuccess, showError, showConfirm, hideModal } = useModal();

  // Fetch products when page or search changes
  useEffect(() => {
    dispatch(fetchProducts({ 
      page: currentPage, 
      limit: 20, 
      search: debouncedSearch 
    }));
  }, [dispatch, currentPage, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Handle delete with optimistic updates
  const handleDelete = useCallback((productId, productName) => {
    showConfirm(
      `Are you sure you want to delete "${productName}"?`,
      "Confirm Delete",
      async () => {
        try {
          // Store original product for potential rollback
          const originalProduct = products.find(p => p._id === productId);
          
          // Optimistically remove the product
          dispatch(optimisticDeleteProduct(productId));
          
          // Attempt to delete from server
          await dispatch(deleteProduct(productId)).unwrap();
          
          // Success - optimistic update was correct
        } catch (error) {
          
          // Revert optimistic update on failure
          if (originalProduct) {
            dispatch(revertOptimisticUpdate({
              type: 'delete',
              productId,
              originalData: originalProduct
            }));
          }
          
          showError(error || "Failed to delete product");
        }
      }
    );
  }, [dispatch, showConfirm, showError, products]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    {
      key: "productCode",
      header: "Code",
      className: "w-24",
      render: (value) => (
        <span className="font-medium text-sm text-gray-900">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      header: "Product",
      className: "w-32",
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-medium truncate ${row.isOptimistic ? 'opacity-60' : ''}`}>
            {value}
            {row.isOptimistic && (
              <span className="ml-2 text-xs text-blue-500">(updating...)</span>
            )}
          </div>
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
        <MemoizedActionIcons
          editPath={`/dashboard/products/edit/${row._id}`}
          onDelete={() => handleDelete(row._id, row.name)}
          showView={false}
          showEdit={true}
          showDelete={true}
          size="sm"
          skipConfirm={true}
        />
      ),
    },
  ], [handleDelete]);

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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Search Filter */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by product name, code, or HSN code"
            value={searchInput}
            onChange={handleSearchChange}
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

        {/* Optimistic Updates Indicator */}
        {optimisticUpdates.creating && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-600">Creating product...</span>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}>
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
