"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getGSTBreakdown } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import PDFInvoice from "@/components/PDFInvoice";

const ViewInvoicePage = ({ params }) => {
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [showPDFInvoice, setShowPDFInvoice] = useState(false);

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
      console.log("Sale data loaded:", {
        paymentStatus: sale.paymentStatus,
        paymentMode: sale.paymentMode,
        amountPaid: sale.amountPaid,
        finalAmount: sale.finalAmount,
        total: sale.total,
        allKeys: Object.keys(sale),
      });

      const paymentStatus = sale.paymentStatus || "Pending";
      setPaymentStatus(paymentStatus);
      setDeliveryStatus(sale.deliveryStatus || "Pending");

      // Auto-fill payment mode and amount based on existing status
      if (paymentStatus === "Paid") {
        const amountToSet = sale.amountPaid
          ? sale.amountPaid.toString()
          : (sale.finalAmount || sale.total || 0).toString();
        console.log("Setting Paid status - amountPaid:", amountToSet);
        setPaymentMode(sale.paymentMode || "Cash");
        setAmountPaid(amountToSet);
      } else if (paymentStatus === "Partial") {
        console.log("Setting Partial status");
        setPaymentMode(sale.paymentMode || "Cash");
        // For Partial status, if no amount is saved, suggest half the total amount
        if (sale.amountPaid) {
          setAmountPaid(sale.amountPaid.toString());
        } else {
          const suggestedAmount = Math.floor(
            (sale.finalAmount || sale.total || 0) / 2
          );
          setAmountPaid(suggestedAmount.toString());
          console.log(
            "No saved amount for Partial status, suggesting:",
            suggestedAmount
          );
        }
      } else {
        console.log("Setting Pending status");
        setPaymentMode(sale.paymentMode || "");
        setAmountPaid(sale.amountPaid ? sale.amountPaid.toString() : "");
      }
    }
  }, [sale]);

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
      if (paymentStatus === "Partial" && amountPaidNum >= sale.finalAmount) {
        alert(
          "For partial payment, amount paid must be less than the total amount"
        );
        return;
      }
      if (paymentStatus === "Paid" && amountPaidNum !== sale.finalAmount) {
        alert("For paid status, amount paid must equal the total amount");
        return;
      }
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
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
              ? new Date(sale.invoiceDate).toLocaleDateString("en-IN")
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
            onClick={() => router.push(`/dashboard/sales/edit/${sale.id}`)}
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
                <p className="text-gray-900">{sale.customer?.shopName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Contact Person:
                </span>
                <p className="text-gray-900">{sale.customer?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Phone:
                </span>
                <p className="text-gray-900">{sale.customer?.phoneNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Address:
                </span>
                <p className="text-gray-900">{sale.customer?.address}</p>
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
                <span className="font-medium text-gray-500">
                  {formatCurrency(sale.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(sale.totalGST || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Value:</span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(sale.subtotal + sale.totalGST || 0)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-gray-500">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(sale.finalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Information */}
              {sale.paymentStatus !== "Pending" && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Payment Information:
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        sale.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}>
                      {sale.paymentStatus}
                    </span>
                  </div>
                  {sale.paymentMode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium text-gray-900">
                        {sale.paymentMode}
                      </span>
                    </div>
                  )}
                  {sale.amountPaid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(sale.amountPaid)}
                      </span>
                    </div>
                  )}
                  {sale.paymentStatus === "Partial" && sale.amountPaid && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(sale.finalAmount - sale.amountPaid)}
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
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    console.log(
                      "Payment status changed to:",
                      newStatus,
                      "sale.finalAmount:",
                      sale?.finalAmount
                    );
                    setPaymentStatus(newStatus);
                    // Auto-fill amount paid and payment mode based on status
                    if (newStatus === "Paid" && sale) {
                      console.log(
                        "Auto-filling Paid status with amount:",
                        sale.finalAmount
                      );
                      setAmountPaid(sale.finalAmount.toString());
                      setPaymentMode("Cash"); // Default to Cash for Paid status
                    } else if (newStatus === "Partial") {
                      console.log("Auto-filling Partial status");
                      // For Partial status, suggest half the total amount
                      const suggestedAmount = Math.floor(
                        (sale.finalAmount || sale.total || 0) / 2
                      );
                      setAmountPaid(suggestedAmount.toString());
                      setPaymentMode("Cash"); // Default to Cash for Partial status
                    } else if (newStatus === "Pending") {
                      console.log("Clearing fields for Pending status");
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
                    {sale.paymentMode && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Current: {sale.paymentMode}
                      </span>
                    )}
                    {paymentMode !== sale.paymentMode && paymentMode && (
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
                    {sale.amountPaid && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Current: ₹{sale.amountPaid}
                      </span>
                    )}
                    {amountPaid !==
                      (sale.amountPaid ? sale.amountPaid.toString() : "") &&
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
                        ? `₹${sale.finalAmount}`
                        : "Enter amount"
                    }
                    min="0"
                    max={
                      paymentStatus === "Paid"
                        ? sale.finalAmount
                        : sale.finalAmount - 0.01
                    }
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                  {paymentStatus === "Partial" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must be less than ₹{sale.finalAmount}
                    </p>
                  )}
                  {paymentStatus === "Paid" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Must equal ₹{sale.finalAmount}
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
                    paymentMode === sale.paymentMode &&
                    amountPaid ===
                      (sale.amountPaid ? sale.amountPaid.toString() : "") &&
                    deliveryStatus === sale.deliveryStatus) ||
                  ((paymentStatus === "Partial" || paymentStatus === "Paid") &&
                    (!paymentMode || !amountPaid || amountPaid <= 0))
                }
                className="w-full">
                {updatingStatus
                  ? "Updating..."
                  : paymentStatus === sale.paymentStatus &&
                    paymentMode === sale.paymentMode &&
                    amountPaid ===
                      (sale.amountPaid ? sale.amountPaid.toString() : "") &&
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

      {/* PDF Invoice Component */}
      {showPDFInvoice && (
        <PDFInvoice sale={sale} onClose={() => setShowPDFInvoice(false)} />
      )}
    </div>
  );
};

export default ViewInvoicePage;
