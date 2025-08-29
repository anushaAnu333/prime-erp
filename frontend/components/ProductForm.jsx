"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "./ui/Form";

export default function ProductForm({ productId = null, onSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    name: "",
    hsnCode: "",
    gstRate: "5",
  });

  const gstRates = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
  ];

  const fields = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: "hsnCode",
      label: "HSN Code",
      type: "text",
      placeholder: "Enter HSN code",
      required: true,
      validation: {
        required: true,
        minLength: 4,
        maxLength: 20,
      },
    },
    {
      name: "gstRate",
      label: "GST Rate",
      type: "select",
      placeholder: "Select GST rate",
      required: true,
      options: gstRates,
      validation: {
        required: true,
      },
    },
  ];

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        const product = data.product;
        setInitialData({
          name: product.name || "",
          hsnCode: product.hsnCode || "",
          gstRate: product.gstRate?.toString() || "5",
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);

    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        gstRate: parseInt(formData.gstRate),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save product");
    }

    const result = await response.json();
    setLoading(false);

    return result;
  };

  const handleSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    } else {
      // Reset form for new product
      if (!productId) {
        setInitialData({
          name: "",
          hsnCode: "",
          gstRate: "5",
        });
      } else {
        // Redirect to product detail page
        router.push(`/dashboard/products/${productId}`);
      }
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  return (
    <Form
      title={productId ? "Edit Product" : "Add New Product"}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      submitText={productId ? "Update" : "Create"}
      cancelText="Cancel"
      showReset={!productId}
      resetText="Reset"
      loading={loading}
      success={
        productId
          ? "Product updated successfully!"
          : "Product created successfully!"
      }
      redirectPath={productId ? `/dashboard/products/${productId}` : null}
      backPath="/dashboard/products"
      backText="Back"
    />
  );
}
