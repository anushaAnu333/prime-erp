"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { calculateItemTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

const BaseInvoiceForm = ({
  type = "invoice", // "invoice", "return"
  mode = "create", // "create", "edit"
  initialData = null,
  onSave = null,
  onCancel = null,
  children, // For custom form fields
  itemFields = [], // Custom item fields
  calculationsComponent = null, // Custom calculations component
  title = "Invoice",
  apiEndpoint = "",
  redirectPath = "",
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Base form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    notes: "",
  });

  // Base items state
  const [items, setItems] = useState([
    {
      product: "",
      expiryDate: "",
      qty: "",
      rate: "",
      taxableValue: 0,
      gst: 0,
      invoiceValue: 0,
    },
  ]);

  // Base calculations state
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        ...formData,
        ...initialData,
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });

      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((item) => ({
            product: item.product || "",
            expiryDate: item.expiryDate || "",
            qty: item.qty || "",
            rate: item.rate || "",
            taxableValue: item.taxableValue || 0,
            gst: item.gst || 0,
            invoiceValue: item.invoiceValue || 0,
          }))
        );
      }
    }
  }, [initialData, mode]);

  // Calculate totals when items or discount changes
  useEffect(() => {
    let totalTaxableValue = 0;
    let totalGST = 0;
    let totalInvoiceValue = 0;

    items.forEach((item) => {
      totalTaxableValue += item.taxableValue || 0;
      totalGST += item.gst || 0;
      totalInvoiceValue += item.invoiceValue || 0;
    });

    const discount = parseFloat(formData.discount) || 0;
    const finalTotal = totalInvoiceValue - discount;

    setCalculations({
      taxableValue: totalTaxableValue,
      gst: totalGST,
      invoiceValue: totalInvoiceValue,
      total: finalTotal,
    });
  }, [items, formData.discount]);

  // Base form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate item totals
    const itemTotals = calculateItemTotals(updatedItems[index]);
    updatedItems[index] = { ...updatedItems[index], ...itemTotals };

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product: "",
        expiryDate: "",
        qty: "",
        rate: "",
        taxableValue: 0,
        gst: 0,
        invoiceValue: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        items: items.filter((item) => item.product && item.qty && item.rate),
        total: calculations.total,
        totalGST: calculations.gst,
        subtotal: calculations.taxableValue,
      };

      const url = mode === "edit" ? `${apiEndpoint}/${initialData._id}` : apiEndpoint;
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const result = await response.json();

      if (onSave) {
        onSave(result);
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Error saving:", error);
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "edit" ? `Edit ${title}` : `Create ${title}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
            
            <Input
              label="Discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Custom form fields */}
          {children}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="sm"
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">
                    Item {index + 1}
                  </h3>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Product"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Expiry Date"
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Quantity"
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                    min="1"
                    required
                  />
                  
                  <Input
                    label="Rate"
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Taxable Value:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(item.taxableValue)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">GST:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(item.gst)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(item.invoiceValue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Custom calculations component or default */}
        {calculationsComponent ? (
          calculationsComponent({ items, calculations, formData })
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculations.taxableValue)}
                </div>
                <div className="text-sm text-gray-600">Subtotal</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculations.gst)}
                </div>
                <div className="text-sm text-gray-600">Total GST</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculations.invoiceValue)}
                </div>
                <div className="text-sm text-gray-600">Invoice Value</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculations.total)}
                </div>
                <div className="text-sm text-blue-600">Final Amount</div>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? "Saving..." : mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BaseInvoiceForm;
