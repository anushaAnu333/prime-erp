"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getGSTBreakdown } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

const ViewInvoicePage = ({ params }) => {
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");

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

  // Set status values when sale data is loaded
  useEffect(() => {
    if (sale) {
      setPaymentStatus(sale.paymentStatus || "Pending");
      setDeliveryStatus(sale.deliveryStatus || "Pending");
    }
  }, [sale]);

  // Handle status update
  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus,
          deliveryStatus,
        }),
      });

      if (response.ok) {
        // Refresh sale data
        await fetchSale();
        alert("Status updated successfully!");
      } else {
        const error = await response.json();
        console.error("Status update error:", error);
        alert(
          error.message || error.errors?.join(", ") || "Failed to update status"
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/sales");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Failed to delete invoice");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
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

  const gstBreakdown = getGSTBreakdown(sale.items);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice #{sale.invoiceNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Created on{" "}
            {sale.invoiceDate
              ? new Date(sale.invoiceDate).toLocaleDateString()
              : "Invalid Date"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/sales/edit/${sale.id}`)}>
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <Card.Header>
            <Card.Title>Customer Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Shop Name:
                </span>
                <p className="text-gray-900">
                  {sale.customerDetails?.shopName}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Contact Person:
                </span>
                <p className="text-gray-900">{sale.customerDetails?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Phone:
                </span>
                <p className="text-gray-900">{sale.customerDetails?.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Address:
                </span>
                <p className="text-gray-900">{sale.customerDetails?.address}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <Card.Header>
            <Card.Title>Invoice Summary</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium">
                  {formatCurrency(sale.totalGST)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Value:</span>
                <span className="font-medium">
                  {formatCurrency(sale.invoiceValue)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Amount:</span>
                  <span>{formatCurrency(sale.finalAmount)}</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Status Information */}
        <Card>
          <Card.Header>
            <Card.Title>Status</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Payment Status:
                </label>
                <div className="mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sale.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : sale.paymentStatus === "Partial"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    Current: {sale.paymentStatus}
                  </span>
                  {paymentStatus !== sale.paymentStatus && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Modified)
                    </span>
                  )}
                </div>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Delivery Status:
                </label>
                <div className="mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sale.deliveryStatus === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : sale.deliveryStatus === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    Current: {sale.deliveryStatus}
                  </span>
                  {deliveryStatus !== sale.deliveryStatus && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Modified)
                    </span>
                  )}
                </div>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={
                  updatingStatus ||
                  (paymentStatus === sale.paymentStatus &&
                    deliveryStatus === sale.deliveryStatus)
                }
                className="w-full">
                {updatingStatus
                  ? "Updating..."
                  : paymentStatus === sale.paymentStatus &&
                    deliveryStatus === sale.deliveryStatus
                  ? "No Changes"
                  : "Update Status"}
              </Button>
              {sale?.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Notes:
                  </span>
                  <p className="mt-1 text-sm text-gray-900">{sale.notes}</p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <Card.Header>
          <Card.Title>Invoice Items</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST ({sale.items[0]?.gstRate || 5}%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.taxableValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.gst)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.invoiceValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {/* GST Breakdown */}
      {Object.keys(gstBreakdown).length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>GST Breakdown</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(gstBreakdown).map(([rate, data]) => (
                <div key={rate} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {rate}% GST
                  </div>
                  <div className="text-xs text-gray-600">
                    Taxable: {formatCurrency(data.taxableAmount)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Tax: {formatCurrency(data.gstAmount)}
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
        size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this invoice? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewInvoicePage;
