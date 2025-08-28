"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailPage from "../../../../components/ui/DetailPage";
import { useModal } from "../../../../hooks/useModal";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showConfirm, showError } = useModal();

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      `Are you sure you want to delete "${product?.name}"?`,
      "Confirm Delete",
      async () => {
        try {
          const response = await fetch(`/api/products/${params.id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            router.push("/dashboard/products");
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

  const fields = [
    {
      fields: [
        {
          key: "productCode",
          label: "Product Code",
          type: "text",
          highlight: true,
        },
        {
          key: "name",
          label: "Product Name",
          type: "text",
        },
        {
          key: "hsnCode",
          label: "HSN Code",
          type: "text",
        },
      ],
    },
    {
      fields: [
        {
          key: "gstRate",
          label: "GST Rate",
          type: "percentage",
        },
        {
          key: "createdAt",
          label: "Created Date",
          type: "date",
        },
        {
          key: "updatedAt",
          label: "Last Updated",
          type: "date",
        },
      ],
    },
  ];

  return (
    <DetailPage
      title="Product Details"
      data={product}
      fields={fields}
      loading={loading}
      error={error}
      editPath={`/dashboard/products/edit/${params.id}`}
      backPath="/dashboard/products"
      backText="Back to Products"
      showEdit={true}
      showDelete={true}
      onDelete={handleDelete}
      emptyMessage="Product not found"
    />
  );
}
