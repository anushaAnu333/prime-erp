"use client";

import { useState } from "react";
import Table from "./ui/Table";

export default function PaymentHistory({ payments, sales }) {
  const [activeTab, setActiveTab] = useState("payments");

  // Extract payments from sales invoices
  const salesPayments = sales
    .filter((s) => s.payments && s.payments.length > 0)
    .flatMap((sale) =>
      sale.payments.map((payment) => ({
        ...payment,
        id: `${sale._id}-${payment._id || Math.random()}`,
        paymentDate: payment.paymentDate,
        amount: payment.amountPaid,
        invoiceNo: sale.invoiceNo,
        saleId: sale._id,
      }))
    );

  // Combine both payment sources
  const allPayments = [
    ...payments.map((p) => ({ ...p, source: "Payment Model" })),
    ...salesPayments.map((p) => ({ ...p, source: "Sales Invoice" })),
  ].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const paymentColumns = [
    { key: "paymentDate", label: "Date", render: (value) => formatDate(value) },
    {
      key: "amount",
      label: "Amount",
      render: (value) => formatCurrency(value),
    },
    { key: "paymentMode", label: "Mode" },
    { key: "source", label: "Source" },
    {
      key: "invoiceNo",
      label: "Invoice No",
      render: (value) => value || "N/A",
    },
    {
      key: "referenceNumber",
      label: "Reference",
      render: (value) => value || "N/A",
    },
    { key: "notes", label: "Notes", render: (value) => value || "N/A" },
  ];

  const salesColumns = [
    { key: "date", label: "Date", render: (value) => formatDate(value) },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "total", label: "Amount", render: (value) => formatCurrency(value) },
    { key: "paymentStatus", label: "Payment Status" },
    {
      key: "payments",
      label: "Payments",
      render: (value) => {
        if (!value || value.length === 0) return "No payments";
        const totalPaid = value.reduce((sum, p) => sum + p.amountPaid, 0);
        return formatCurrency(totalPaid);
      },
    },
    { key: "type", label: "Type" },
    { key: "deliveryStatus", label: "Delivery Status" },
  ];

  const paymentData = allPayments.map((payment) => ({
    ...payment,
    id: payment._id || payment.id,
  }));

  const salesData = sales.map((sale) => ({
    ...sale,
    id: sale._id,
  }));

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "payments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          Payment History ({allPayments.length})
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "sales"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          Sales History ({sales.length})
        </button>
      </div>

      {activeTab === "payments" && (
        <div>
          {allPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payment records found
            </div>
          ) : (
            <Table
              data={paymentData}
              columns={paymentColumns}
              className="min-w-full"
            />
          )}
        </div>
      )}

      {activeTab === "sales" && (
        <div>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sales records found
            </div>
          ) : (
            <Table
              data={salesData}
              columns={salesColumns}
              className="min-w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
