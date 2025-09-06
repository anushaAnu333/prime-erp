"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { use } from "react";
import { getGSTBreakdown } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import PDFInvoice from "@/components/PDFInvoice";
import {
  updateSale,
  fetchSaleById,
  selectSalesLoading,
  selectSalesError,
  selectCurrentSale,
} from "@/lib/store/slices/salesSlice";

const ViewInvoicePage = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector(selectSalesLoading);
  const error = useSelector(selectSalesError);
  const sale = useSelector(selectCurrentSale);
  
  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [showPDFInvoice, setShowPDFInvoice] = useState(false);

  // Helper function to check if invoice is fully paid
  const isInvoiceFullyPaid = () => {
    if (!sale) return false;
    const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
    const invoiceTotal = sale.finalAmount || sale.total || 0;
    return totalPaid >= invoiceTotal;
  };

  // Helper function to check if invoice is completed (both delivered and fully paid)
  const isInvoiceCompleted = () => {
    return isInvoiceFullyPaid() && (sale?.deliveryStatus === "Delivered");
  };

  // Unwrap params for Next.js 15 compatibility
  const unwrappedParams = use(params);
  const saleId = unwrappedParams.id;

  useEffect(() => {
    if (saleId) {
      dispatch(fetchSaleById(saleId));
    }
  }, [dispatch, saleId]);

  // Set status values when sale data is loaded
  useEffect(() => {
    if (sale) {
      console.log("Sale data loaded:", {
        paymentStatus: sale.paymentStatus,
        paymentMode: sale.paymentMode,
        amountPaid: sale.amountPaid,
        finalAmount: sale.finalAmount,
        total: sale.total,
        payments: sale.payments,
        paymentsLength: sale.payments?.length,
        allKeys: Object.keys(sale),
      });

      // 🔧 CONVERSION: If no payments array but has amountPaid, create one
      if (!sale.payments && sale.amountPaid && sale.amountPaid > 0) {
        console.log("🔧 Converting legacy payment data to payments array");
        const legacyPayment = {
          amountPaid: sale.amountPaid,
          paymentMode: sale.paymentMode || "Cash",
          paymentDate: sale.updatedAt || sale.createdAt || new Date().toISOString(),
          notes: sale.notes || `Payment via ${sale.paymentMode || "Cash"}`,
          referenceNumber: sale.referenceNumber || null
        };
        // Add the converted payment to the sale object
        sale.payments = [legacyPayment];
        console.log("✅ Created payments array:", sale.payments);
      }

      const paymentStatus = sale.paymentStatus || "Pending";
      setPaymentStatus(paymentStatus);
      setDeliveryStatus(sale.deliveryStatus || "Pending");

      // Don't auto-fill any amounts - let user enter manually
      setPaymentMode("");
      setAmountPaid("");
        setReferenceNumber("");
    }
  }, [sale]);

  // Handle status update
  const handleStatusUpdate = async () => {
    // Only validate payment fields if making a payment (amount entered)
    const isPaymentStatusChanging = paymentStatus !== sale?.paymentStatus;
    const isMakingPayment = (paymentStatus === "Partial" || paymentStatus === "Paid") && amountPaid && parseFloat(amountPaid) > 0;
    
    if (isMakingPayment) {
      if (!paymentMode) {
        alert("Please select a payment mode");
        return;
      }
      if (!amountPaid || amountPaid <= 0) {
        alert("Please enter a valid amount paid");
        return;
      }
      if (paymentMode === "Online" && !referenceNumber.trim()) {
        alert("Please enter a reference number for online payments");
        return;
      }

      const amountPaidNum = parseFloat(amountPaid);
      const totalPreviousPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
      const invoiceTotal = sale.finalAmount || sale.total || 0; // Handle different field names
      const remainingAmount = invoiceTotal - totalPreviousPaid;
      
      if (paymentStatus === "Partial" && amountPaidNum > remainingAmount) {
        alert(
          `Payment amount (₹${amountPaidNum.toLocaleString("en-IN")}) cannot exceed the remaining balance of ₹${remainingAmount.toLocaleString("en-IN")}`
        );
        return;
      }
      if (paymentStatus === "Paid" && amountPaidNum !== remainingAmount) {
        alert(`For paid status, amount must equal the remaining balance of ₹${remainingAmount.toLocaleString("en-IN")}`);
        return;
      }
    }

    try {
      // Calculate payment amounts
      const totalPreviousPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
      const invoiceTotal = sale.finalAmount || sale.total || 0;
      
      // Prepare payment data
      const updateData = {
          paymentStatus,
          deliveryStatus,
      };

      // Add payment transaction if making a payment (either status changing or adding to existing partial payments)
      if ((paymentStatus === "Partial" || paymentStatus === "Paid") && amountPaid && parseFloat(amountPaid) > 0) {
        const newPayment = {
          paymentDate: new Date().toISOString(),
          paymentMode,
          amountPaid: parseFloat(amountPaid),
        };

        // Add reference number or notes based on payment mode
        if (paymentMode === "Online") {
          newPayment.referenceNumber = referenceNumber.trim();
        } else if (paymentMode === "Cash" && referenceNumber.trim()) {
          newPayment.notes = referenceNumber.trim(); // Save as notes for cash payments
        }

        // Add to existing payments array or create new one
        updateData.payments = [...(sale.payments || []), newPayment];
        updateData.paymentMode = paymentMode;
        updateData.amountPaid = parseFloat(amountPaid);
        
        // Calculate new total paid amount
        const newTotalPaid = totalPreviousPaid + parseFloat(amountPaid);
        
        // Auto-update payment status if full amount is collected
        if (newTotalPaid >= invoiceTotal) {
          updateData.paymentStatus = "Paid";
          console.log(`Auto-updating payment status to 'Paid' as full amount (₹${invoiceTotal}) has been collected`);
        }
        
        // Store reference/notes in main record too for backward compatibility
        if (paymentMode === "Online" && referenceNumber.trim()) {
          updateData.referenceNumber = referenceNumber.trim();
        } else if (paymentMode === "Cash" && referenceNumber.trim()) {
          updateData.paymentNotes = referenceNumber.trim();
        }
      }

      await dispatch(updateSale({ id: saleId, data: updateData })).unwrap();
      
      // Refresh the sale data
      dispatch(fetchSaleById(saleId));
      
      // Show detailed success message
      const totalPaidAfterUpdate = totalPreviousPaid + parseFloat(amountPaid);
      const remainingAfterUpdate = invoiceTotal - totalPaidAfterUpdate;
      
      let successMessage = `Payment of ₹${parseFloat(amountPaid).toLocaleString("en-IN")} recorded successfully!\\n`;
      successMessage += `Total paid: ₹${totalPaidAfterUpdate.toLocaleString("en-IN")}\\n`;
      
      if (remainingAfterUpdate <= 0) {
        successMessage += "🎉 Invoice fully paid!";
      } else {
        successMessage += `Remaining balance: ₹${remainingAfterUpdate.toLocaleString("en-IN")}`;
      }
      
      alert(successMessage);
      
      // Clear form fields after successful update
      if (paymentStatus !== "Pending") {
        setAmountPaid("");
        setReferenceNumber("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.message || "Failed to update status");
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
console.log(sale);
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
                    {formatCurrency(sale.finalAmount || sale.total)}
                  </span>
                </div>
              </div>

           

              {/* Show message for pending payments */}
              {sale.paymentStatus === "Pending" && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-sm text-gray-500 italic">
                    No payments recorded yet. Update the payment status below to add payment information.
                  </div>
                    </div>
                  )}

              {/* Payment Summary - Show only totals */}
              {sale.payments && sale.payments.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Payment Summary:
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="text-green-600">
                        {formatCurrency(sale.payments.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0))}
                      </span>
                    </div>
                    {sale.paymentStatus === "Partial" && (
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600">Outstanding:</span>
                        <span className="text-orange-600">
                          {formatCurrency((sale.finalAmount || sale.total) - sale.payments.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0))}
                      </span>
                </div>
              )}

                  </div>
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
            {/* Debug: Show payment data */}
           
            <div className="space-y-4">
              {/* Payment Status - Hide when invoice is completed */}
              {!isInvoiceCompleted() && (
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
                      console.log("Setting Paid status");
                      setAmountPaid(""); // Don't auto-fill, let user enter
                      setPaymentMode(""); // Don't default to any mode
                    } else if (newStatus === "Partial") {
                      console.log("Setting Partial status");
                      setAmountPaid(""); // Don't auto-fill, let user enter
                      setPaymentMode(""); // Don't default to any mode
                    } else if (newStatus === "Pending") {
                      console.log("Clearing fields for Pending status");
                      setAmountPaid("");
                      setPaymentMode("");
                      setReferenceNumber("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
                </div>
              )}

              {/* Show message if invoice is completed (both delivered and fully paid) */}
              {isInvoiceCompleted() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Invoice Completed ✅
                      </h3>
                      <p className="text-xs text-green-700 mt-1">
                        This invoice has been delivered and fully paid. Transaction is complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

             
              {/* Payment Mode - Only show if status is Partial or Paid AND not fully paid */}
              {!isInvoiceFullyPaid() && (paymentStatus === "Partial" || paymentStatus === "Paid") && (
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
                    onChange={(e) => {
                      setPaymentMode(e.target.value);
                      // Clear reference number when payment mode changes
                      setReferenceNumber("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              )}

              {/* Amount Paid - Show if status is Partial/Paid AND not fully paid */}
              {!isInvoiceFullyPaid() && (paymentStatus === "Partial" || paymentStatus === "Paid") && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Payment Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={(() => {
                      const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                      const invoiceTotal = sale.finalAmount || sale.total;
                      const remaining = invoiceTotal - totalPaid;
                      
                      if (paymentStatus === "Paid") {
                        return `Enter ₹${remaining.toLocaleString("en-IN")} to complete payment`;
                      } else {
                        return `Enter amount (Max: ₹${remaining.toLocaleString("en-IN")})`;
                      }
                    })()}
                    min="0.01"
                    max={(() => {
                      const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                      const invoiceTotal = sale.finalAmount || sale.total;
                      const remaining = invoiceTotal - totalPaid;
                      return paymentStatus === "Paid" ? remaining : remaining - 0.01;
                    })()}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                  
                  {/* Helper Text */}
                  <div className="mt-1 text-xs text-gray-500">
                    {(() => {
                      const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                      const invoiceTotal = sale.finalAmount || sale.total;
                      const remaining = invoiceTotal - totalPaid;
                      
                      if (paymentStatus === "Paid") {
                        return `To mark as fully paid, enter exactly ₹${remaining.toLocaleString("en-IN")}`;
                      } else {
                        return `For partial payment, enter any amount up to ₹${(remaining - 0.01).toLocaleString("en-IN")}`;
                      }
                    })()}
                  </div>

                  {/* Quick Amount Buttons */}
                  {paymentStatus === "Partial" && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {(() => {
                        const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                        const invoiceTotal = sale.finalAmount || sale.total;
                        const remaining = invoiceTotal - totalPaid;
                        const suggestions = [
                          Math.round(remaining * 0.25),
                          Math.round(remaining * 0.5),
                          Math.round(remaining * 0.75),
                          remaining - 1 // Almost full payment
                        ].filter(amount => amount > 0 && amount < remaining);
                        
                        return suggestions.map((amount, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setAmountPaid(amount.toString())}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            ₹{amount.toLocaleString("en-IN")}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                  
                  {/* Full Payment Button */}
                  {paymentStatus === "Paid" && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                          const invoiceTotal = sale.finalAmount || sale.total;
                          const remaining = invoiceTotal - totalPaid;
                          setAmountPaid(remaining.toString());
                        }}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Pay Full Amount (₹{(() => {
                          const totalPaid = sale.payments?.reduce((sum, payment) => sum + (Number(payment.amountPaid) || 0), 0) || 0;
                          const invoiceTotal = sale.finalAmount || sale.total;
                          return (invoiceTotal - totalPaid).toLocaleString("en-IN");
                        })()})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reference Number for Online Payments */}
              {!isInvoiceFullyPaid() && (paymentStatus === "Partial" || paymentStatus === "Paid") && paymentMode === "Online" && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Reference Number: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter transaction reference number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required: Enter the transaction ID or reference number for online payments
                  </p>
                </div>
              )}

              {/* Notes for Cash Payments */}
              {(paymentStatus === "Partial" || paymentStatus === "Paid") && paymentMode === "Cash" && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Payment Notes:
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter any notes for this cash payment (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add any notes or reference for tracking this cash payment
                  </p>
                </div>
              )}
              {/* Delivery Status - Hide when invoice is completed */}
              {!isInvoiceCompleted() && (
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
              )}
              {/* Hide Update button ONLY when BOTH delivered AND fully paid */}
              {!isInvoiceCompleted() && (
                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    loading ||
                    // Disable if nothing has changed AND no payment amount entered
                    (paymentStatus === sale?.paymentStatus &&
                      deliveryStatus === sale?.deliveryStatus &&
                      !amountPaid) ||
                    // Disable if trying to make payment but missing required fields
                    ((paymentStatus === "Partial" || paymentStatus === "Paid") &&
                      amountPaid && parseFloat(amountPaid) > 0 && // Only check if actually making a payment
                      (!paymentMode || !amountPaid || amountPaid <= 0)) ||
                    // Disable if online payment but no reference number
                    (paymentStatus !== "Pending" && paymentMode === "Online" && 
                      amountPaid && parseFloat(amountPaid) > 0 && // Only check if actually making a payment
                      !referenceNumber.trim())
                  }
                  className="w-full">
                  {loading
                    ? "Updating..."
                    : "Update Status"}
                </Button>
              )}
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

      {/* Payment Transactions Table */}
      {sale.payments && sale.payments.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Payment Transactions ({sale.payments.length})</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference/Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sale.payments.map((payment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.paymentMode === 'Cash' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(Number(payment.amountPaid))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {payment.paymentMode === "Online" ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {payment.referenceNumber || "No reference"}
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            {payment.notes || "No notes"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             
              </table>
            </div>
          </Card.Content>
        </Card>
      )}

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
