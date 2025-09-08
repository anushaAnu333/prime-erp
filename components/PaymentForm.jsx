"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Modal from "./ui/Modal";

export default function PaymentForm({
  customer,
  onPaymentSuccess,
  isOpen,
  onClose,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMode: "Cash",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: customer._id,
          customerName: customer.name,
          amount: parseFloat(formData.amount),
          paymentMode: formData.paymentMode,
          paymentDate: formData.paymentDate,
          referenceNumber: formData.referenceNumber,
          notes: formData.notes,
          companyId: customer.companyId,
          type: "Payment Received",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onPaymentSuccess(result.payment);
        onClose();
        // Reset form
        setFormData({
          amount: "",
          paymentMode: "Cash",
          paymentDate: new Date().toISOString().split("T")[0],
          referenceNumber: "",
          notes: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      setError("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {customer.name} ({customer.customerCode})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <Input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode *
          </label>
          <Select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleInputChange}
            required>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date *
          </label>
          <Input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <Input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleInputChange}
            placeholder="Transaction ID, Cheque number, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
