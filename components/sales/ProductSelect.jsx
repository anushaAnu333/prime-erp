"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select from "@/components/ui/Select";
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
} from "@/lib/store/slices/productsSlice";

const ProductSelect = ({
  value,
  onProductSelect,
  error = false,
  disabled = false,
  className = "",
  placeholder = "Select a product",
}) => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);

  // Initial fetch
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts({ page: 1, limit: 50 }));
    }
  }, [dispatch, products]);

  // Handle search
  const handleSearch = (search) => {
    dispatch(fetchProducts({ page: 1, limit: 50, search }));
  };

  // Handle product selection
  const handleProductChange = (productName) => {
    if (
      productName &&
      onProductSelect &&
      typeof onProductSelect === "function"
    ) {
      const selectedProduct = (products || []).find((p) => p.name === productName);
      if (selectedProduct) {
        onProductSelect(selectedProduct);
      }
    }
  };

  // Format options for select - use product name as both value and label
  const options = (products || []).map((product) => ({
    value: product.name,
    label: product.name,
    product: product,
  }));

  return (
    <div className={className}>
      <Select
        options={options}
        value={value}
        onChange={handleProductChange}
        placeholder={placeholder || "Select a product"}
        searchable={true}
        loading={loading}
        disabled={disabled}
        error={error}
        onSearch={handleSearch}
        displayKey="label"
        valueKey="value"
      />
    </div>
  );
};

export default ProductSelect;
