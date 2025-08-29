"use client";

import ProductForm from "../../../../../components/ProductForm";

export default function EditProductPage({ params }) {
  return <ProductForm productId={params.id} />;
}
