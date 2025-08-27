"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerSelect from "./CustomerSelect";
import ProductSelect from "./ProductSelect";
import { calculateItemTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const PRODUCTS = ["dosa", "idli", "chapati", "parata", "paneer", "green peas"];

const SalesInvoiceForm = ({
  initialData = null,
  mode = "create",
  onSave = null,
  onCancel = null,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    notes: "",
  });

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
        customerId: initialData.customerId || "",
        customerName: initialData.customerName || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        discount: initialData.discount || 0,
        notes: initialData.notes || "",
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

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate item totals if qty or rate changed
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updatedItems[index].qty) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      const product = updatedItems[index].product;

      if (product && qty && rate) {
        const totals = calculateItemTotals(
          product,
          qty,
          rate,
          updatedItems[index].expiryDate
        );
        updatedItems[index] = {
          ...updatedItems[index],
          taxableValue: totals.taxableValue,
          gst: totals.gst,
          invoiceValue: totals.invoiceValue,
        };
      }
    }

    setItems(updatedItems);
  };

  // Handle product selection
  const handleProductSelect = (index, product) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      product: product.name,
      rate: product.rate,
    };

    // Recalculate totals if qty is already set
    if (updatedItems[index].qty && product.rate) {
      const totals = calculateItemTotals(
        product.name,
        updatedItems[index].qty,
        product.rate,
        updatedItems[index].expiryDate
      );
      updatedItems[index] = {
        ...updatedItems[index],
        taxableValue: totals.taxableValue,
        gst: totals.gst,
        invoiceValue: totals.invoiceValue,
      };
    }

    setItems(updatedItems);
  };

  // Add item to invoice
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

  // Remove item from invoice
  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        items: items.map((item) => ({
          product: item.product,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
          expiryDate: item.expiryDate,
        })),
        discount: parseFloat(formData.discount),
        date: formData.date,
        notes: formData.notes,
      };

      const url =
        mode === "edit" ? `/api/sales/${initialData.id}` : "/api/sales";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        if (onSave) {
          onSave(result);
        } else {
          router.push(`/dashboard/sales/${result.sale.id}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      setError("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {mode === "create" ? "Create Sales Invoice" : "Edit Sales Invoice"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <CustomerSelect
                value={formData.customerId}
                onCustomerSelect={handleCustomerSelect}
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>
              <Button
                type="button"
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">
                + Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-700">
                    Item {index + 1}
                  </h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm">
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product
                    </label>
                    <ProductSelect
                      value={item.product}
                      onProductSelect={(product) =>
                        handleProductSelect(index, product)
                      }
                      placeholder="Select product..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) =>
                        handleItemChange(index, "expiryDate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      placeholder="Enter quantity"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate
                    </label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      placeholder="Enter rate per unit"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxable Value
                    </label>
                    <Input
                      value={`₹${item.taxableValue.toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST
                    </label>
                    <Input
                      value={`₹${item.gst.toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Value
                    </label>
                    <Input
                      value={`₹${item.invoiceValue.toFixed(2)}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discount and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <Input
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder="Enter discount amount"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total
              </label>
              <Input
                value={`₹${calculations.total.toFixed(2)}`}
                disabled
                className="bg-green-50 border-green-200 text-green-800 font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
              {loading
                ? "Creating..."
                : `${mode === "create" ? "Create" : "Update"} Sales Invoice`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  customerId: "",
                  customerName: "",
                  date: new Date().toISOString().split("T")[0],
                  discount: 0,
                  notes: "",
                });
                setItems([
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
              }}
              className="px-6 py-3">
              Reset Form
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SalesInvoiceForm;
