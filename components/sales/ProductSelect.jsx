"use client";

import { useState, useEffect } from "react";
import Select from "@/components/ui/Select";

const ProductSelect = ({
  value,
  onProductSelect,
  error = false,
  disabled = false,
  className = "",
  placeholder = "Select a product",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products
  const fetchProducts = async (search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search
  const handleSearch = (search) => {
    fetchProducts(search);
  };

  // Handle product selection
  const handleProductChange = (productName) => {
    if (
      productName &&
      onProductSelect &&
      typeof onProductSelect === "function"
    ) {
      const selectedProduct = products.find((p) => p.name === productName);
      if (selectedProduct) {
        onProductSelect(selectedProduct);
      }
    }
  };

  // Format options for select - use product name as both value and label
  const options = products.map((product) => ({
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
