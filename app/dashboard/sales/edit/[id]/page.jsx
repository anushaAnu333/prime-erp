"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import SalesInvoiceForm from "@/components/sales/SalesInvoiceForm";
import Button from "@/components/ui/Button";

const EditInvoicePage = ({ params }) => {
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params);
  const saleId = unwrappedParams.id;

  // Fetch sale details
  const fetchSale = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`);
      if (response.ok) {
        const data = await response.json();
        setSale(data.sale);
      } else {
        console.error("Failed to fetch sale");
        router.push("/dashboard/sales");
      }
    } catch (error) {
      console.error("Error fetching sale:", error);
      router.push("/dashboard/sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  // Handle save
  const handleSave = (result) => {
    router.push(`/dashboard/sales/${result.sale.id}`);
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/dashboard/sales/${saleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Invoice not found
        </h2>
        <p className="mt-2 text-gray-600">
          The invoice you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => router.push("/dashboard/sales")}
          className="mt-4">
          Back to Sales
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Invoice #{sale.invoiceNumber}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the invoice details and items
        </p>
      </div>

      <SalesInvoiceForm
        mode="edit"
        initialData={sale}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditInvoicePage;
