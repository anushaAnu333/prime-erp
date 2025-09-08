"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getGSTBreakdown } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import PDFInvoice from "@/components/PDFInvoice";

const ViewPurchasePage = ({ params }) => {
  const router = useRouter();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [showPDFInvoice, setShowPDFInvoice] = useState(false);

  // Get purchase ID from params
  const resolvedParams = use(params);
  const purchaseId = resolvedParams.id;

  // Fetch purchase details
  const fetchPurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchase(data);
      } else {
        router.push("/dashboard/purchases");
      }
    } catch (error) {
      router.push("/dashboard/purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [purchaseId]);

  // Set status values when purchase data is loaded
  useEffect(() => {
    if (purchase) {

      const paymentStatus = purchase.paymentStatus || "Pending";
      setPaymentStatus(paymentStatus);
      setDeliveryStatus(purchase.deliveryStatus || "Pending");

      // Auto-fill payment mode and amount based on existing status
      if (paymentStatus === "Paid") {
        const amountToSet = purchase.amountPaid
          ? purchase.amountPaid.toString()
          : (purchase.total || 0).toString();
        setPaymentMode(purchase.paymentMode || "Cash");
        setAmountPaid(amountToSet);
      } else if (paymentStatus === "Partial") {
        setPaymentMode(purchase.paymentMode || "Cash");
        // For Partial status, if no amount is saved, suggest half the total amount
        if (purchase.amountPaid) {
          setAmountPaid(purchase.amountPaid.toString());
        } else {
          const suggestedAmount = Math.floor((purchase.total || 0) / 2);
          setAmountPaid(suggestedAmount.toString());
        }
      } else {
        setPaymentMode(purchase.paymentMode || "");
        setAmountPaid(
          purchase.amountPaid ? purchase.amountPaid.toString() : ""
        );
      }
    }
  }, [purchase]);

  // Handle status update
  const handleStatusUpdate = async () => {
    // Validate required fields
    if (paymentStatus === "Partial" || paymentStatus === "Paid") {
      if (!paymentMode) {
        alert("Please select a payment mode");
        return;
      }
      if (!amountPaid || amountPaid <= 0) {
        alert("Please enter a valid amount paid");
        return;
      }

      const amountPaidNum = parseFloat(amountPaid);
      if (paymentStatus === "Partial" && amountPaidNum >= purchase.total) {
        alert(
          "For partial payment, amount paid must be less than the total amount"
        );
        return;
      }
      if (paymentStatus === "Paid" && amountPaidNum !== purchase.total) {
        alert("For paid status, amount paid must equal the total amount");
        return;
      }
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus,
          paymentMode,
          amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
          deliveryStatus,
        }),
      });

      if (response.ok) {
        // Refresh purchase data
        await fetchPurchase();
        alert("Status updated successfully!");
      } else {
        const error = await response.json();
        alert(
          error.message || error.errors?.join(", ") || "Failed to update status"
        );
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/purchases");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete purchase");
      }
    } catch (error) {
      alert("Failed to delete purchase");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle PDF download
  const handlePDFDownload = () => {
    setShowPDFInvoice(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Purchase not found
        </h2>
        <p className="mt-2 text-gray-600">
          The purchase you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => router.push("/dashboard/purchases")}
          className="mt-4">
          Back to Purchases
        </Button>
      </div>
    );
  }

  const gstBreakdown = getGSTBreakdown(purchase.items);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase #{purchase.purchaseNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Created on{" "}
            {purchase.date
              ? new Date(purchase.date).toLocaleDateString()
              : "Invalid Date"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2 no-print">
          <Button
            variant="outline"
            onClick={handlePDFDownload}
            className="pdf-button">
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/purchases/edit/${purchase._id}`)
            }
            className="edit-button">
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="delete-button text-red-600 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Information */}
        <Card>
          <Card.Header>
            <Card.Title>Vendor Information</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Vendor Name:
                </span>
                <p className="text-gray-900">{purchase.vendorDetails?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Phone:
                </span>
                <p className="text-gray-900">{purchase.vendorDetails?.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Address:
                </span>
                <p className="text-gray-900">
                  {purchase.vendorDetails?.address}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  GST Number:
                </span>
                <p className="text-gray-900 font-mono text-sm">
                  {purchase.vendorDetails?.gstNumber}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Purchase Summary */}
        <Card>
          <Card.Header>
            <Card.Title>Purchase Summary</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(
                    purchase.items.reduce(
                      (sum, item) => sum + item.taxableValue,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(
                    purchase.items.reduce((sum, item) => sum + item.gst, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Value:</span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(
                    purchase.items.reduce(
                      (sum, item) => sum + item.invoiceValue,
                      0
                    )
                  )}
                </span>
              </div>
              {purchase.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-gray-500">
                    -{formatCurrency(purchase.discount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(purchase.total)}
                  </span>
                </div>
              </div>

              {/* Payment Information */}
              {purchase.paymentStatus !== "Pending" && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Payment Information:
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        purchase.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}>
                      {purchase.paymentStatus}
                    </span>
                  </div>
                  {purchase.paymentMode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium text-gray-900">
                        {purchase.paymentMode}
                      </span>
                    </div>
                  )}
                  {purchase.amountPaid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(purchase.amountPaid)}
                      </span>
                    </div>
                  )}
                  {purchase.paymentStatus === "Partial" &&
                    purchase.amountPaid && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency(purchase.total - purchase.amountPaid)}
                        </span>
                      </div>
                    )}
                </div>
              )}
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
                      purchase.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : purchase.paymentStatus === "Partial"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    Current: {purchase.paymentStatus}
                  </span>
                  {paymentStatus !== purchase.paymentStatus && (
                    <span className="ml-2 text-xs text-blue-600">
                      (Modified)
                    </span>
                  )}
                </div>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setPaymentStatus(newStatus);
                    // Auto-fill amount paid and payment mode based on status
                    if (newStatus === "Paid" && purchase) {
                      setAmountPaid(purchase.total.toString());
                      setPaymentMode("Cash"); // Default to Cash for Paid status
                    } else if (newStatus === "Partial") {
                      // For Partial status, suggest half the total amount
                      const suggestedAmount = Math.floor(
                        (purchase.total || 0) / 2
                      );
                      setAmountPaid(suggestedAmount.toString());
                      setPaymentMode("Cash"); // Default to Cash for Partial status
                    } else if (newStatus === "Pending") {
                      setAmountPaid("");
                      setPaymentMode("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Payment Mode - Only show if status is Partial or Paid */}
              {(paymentStatus === "Partial" || paymentStatus === "Paid") && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Payment Mode:
                  </label>
                  <div className="mb-2">
                    {purchase.paymentMode && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Current: {purchase.paymentMode}
                      </span>
                    )}
                    {paymentMode !== purchase.paymentMode && paymentMode && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Modified)
                      </span>
                    )}
                  </div>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              )}

              {/* Amount Paid - Only show if status is Partial or Paid */}
              {(paymentStatus === "Partial" || paymentStatus === "Paid") && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Amount Paid (₹):
                  </label>
                  <div className="mb-2">
                    {purchase.amountPaid && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Current: ₹{purchase.amountPaid}
                      </span>
                    )}
                    {amountPaid !==
                      (purchase.amountPaid
                        ? purchase.amountPaid.toString()
                        : "") &&
                      amountPaid && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Modified)
                        </span>
                      )}
                  </div>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={
                      paymentStatus === "Paid"
                        ? `₹${purchase.total}`
                        : "Enter amount"
                    }
                    min="0"
                    max={
                      paymentStatus === "Paid"
                        ? purchase.total
                        : purchase.total - 0.01
                    }
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                  {paymentStatus === "Partial" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must be less than ₹{purchase.total}
                    </p>
                  )}
                  {paymentStatus === "Paid" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must equal ₹{purchase.total}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Delivery Status:
                </label>
                <div className="mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      purchase.deliveryStatus === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : purchase.deliveryStatus === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    Current: {purchase.deliveryStatus}
                  </span>
                  {deliveryStatus !== purchase.deliveryStatus && (
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
                  (paymentStatus === purchase.paymentStatus &&
                    paymentMode === purchase.paymentMode &&
                    amountPaid ===
                      (purchase.amountPaid
                        ? purchase.amountPaid.toString()
                        : "") &&
                    deliveryStatus === purchase.deliveryStatus) ||
                  ((paymentStatus === "Partial" || paymentStatus === "Paid") &&
                    (!paymentMode || !amountPaid || amountPaid <= 0))
                }
                className="w-full">
                {updatingStatus
                  ? "Updating..."
                  : paymentStatus === purchase.paymentStatus &&
                    paymentMode === purchase.paymentMode &&
                    amountPaid ===
                      (purchase.amountPaid
                        ? purchase.amountPaid.toString()
                        : "") &&
                    deliveryStatus === purchase.deliveryStatus
                  ? "No Changes"
                  : "Update Status"}
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <Card.Header>
          <Card.Title>Purchase Items</Card.Title>
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
                    HSN Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST ({purchase.items[0]?.gstRate || 5}%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchase.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.hsnCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unit || "-"}
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
        title="Delete Purchase"
        size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this purchase? This action cannot be
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

      {/* PDF Invoice Component */}
      {showPDFInvoice && (
        <PDFInvoice
          purchase={purchase}
          onClose={() => setShowPDFInvoice(false)}
        />
      )}
    </div>
  );
};

export default ViewPurchasePage;
