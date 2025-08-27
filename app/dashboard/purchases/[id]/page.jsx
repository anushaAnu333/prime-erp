"use client";

import { useState, useEffect } from "react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Link from "next/link";
import { formatCurrency } from "../../../../lib/utils";

export default function PurchaseDetailPage({ params }) {
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchase();
  }, [params.id]);

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPurchase(data);
      } else {
        setError("Purchase not found");
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
      setError("Failed to fetch purchase details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-amber-50 text-amber-800 border-amber-200",
      Received: "bg-emerald-50 text-emerald-800 border-emerald-200",
      Cancelled: "bg-red-50 text-red-800 border-red-200",
      Returned: "bg-blue-50 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-50 text-gray-800 border-gray-200"
        }`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Purchase Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard/purchases">
            <Button variant="outline">Back to Purchases</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-light text-gray-900 mb-1">
              {purchase.purchaseType === "Purchase"
                ? "Purchase Invoice"
                : "Purchase Return"}
            </h1>
            <p className="text-gray-500 font-medium">
              {purchase.purchaseNumber}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/purchases">
              <Button variant="outline" className="w-full sm:w-auto">
                ← Back to List
              </Button>
            </Link>
            <Link href={`/dashboard/purchases/edit/${purchase._id}`}>
              <Button className="w-full sm:w-auto">Edit Purchase</Button>
            </Link>
          </div>
        </div>

        {/* Status and Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Status:</span>
            {getStatusBadge(purchase.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-900">
              {formatDate(purchase.date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium text-gray-900 capitalize">
              {purchase.purchaseType}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Information */}
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Purchase Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Purchase Number
                </label>
                <p className="text-gray-900 font-medium">
                  {purchase.purchaseNumber}
                </p>
              </div>
              {purchase.supplierInvoiceNumber && (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Supplier Invoice
                  </label>
                  <p className="text-gray-900 font-medium">
                    {purchase.supplierInvoiceNumber}
                  </p>
                </div>
              )}
              {purchase.supplierInvoiceDate && (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Supplier Invoice Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(purchase.supplierInvoiceDate)}
                  </p>
                </div>
              )}
              {purchase.againstPurchaseId && (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Against Purchase
                  </label>
                  <Link
                    href={`/dashboard/purchases/${purchase.againstPurchaseId._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium">
                    {purchase.againstPurchaseId.purchaseNumber}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Vendor Information */}
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Vendor Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Vendor Name
                </label>
                <p className="text-gray-900 font-medium">
                  {purchase.vendorDetails.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{purchase.vendorDetails.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-500 block mb-1">
                  Address
                </label>
                <p className="text-gray-900">
                  {purchase.vendorDetails.address}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  GST Number
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {purchase.vendorDetails.gstNumber}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Items</span>
                <span className="font-medium text-gray-900">
                  {purchase.items.length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    purchase.items.reduce(
                      (sum, item) => sum + item.invoiceValue,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(purchase.discount)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(purchase.total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Items Table */}
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Items ({purchase.items.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Product
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Expiry Date
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">
                  Quantity
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">
                  Rate
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">
                  Taxable Value
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">
                  GST
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {item.product}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(item.expiryDate)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {item.qty}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatCurrency(item.taxableValue)}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {formatCurrency(item.gst)}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(item.invoiceValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
