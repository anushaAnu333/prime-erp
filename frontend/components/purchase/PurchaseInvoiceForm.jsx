"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import {
  calculatePurchaseTotals,
  getProductOptions,
} from "../../lib/calculations";

const UNITS = ["kg", "packet", "piece", "dozen", "box"];

export default function PurchaseInvoiceForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    vendorName: "",
    supplierInvoiceNumber: "",
    supplierInvoiceDate: "",
    discount: 0,
  });

  const [items, setItems] = useState([
    {
      product: "",
      expiryDate: "",
      qty: "",
      rate: "",
      unit: "",
      taxableValue: 0,
      gst: 0,
      invoiceValue: 0,
    },
  ]);

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Fetch vendors and products on component mount
  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

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

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/vendors");
      if (response.ok) {
        const data = await response.json();
        setVendors(
          data.vendors?.map((vendor) => ({
            value: vendor.vendorName,
            label: `${vendor.vendorName} - ${vendor.contactPerson}`,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getProductDetails = (productName) => {
    return products.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );
  };

  // Convert products array to options format for Select component
  const getProductOptions = () => {
    return products.map((product) => ({
      value: product.name,
      label: product.name,
    }));
  };

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

    // Recalculate item totals if qty or rate changed
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updatedItems[index].qty) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      const product = updatedItems[index].product;

      if (product && qty && rate) {
        const totals = calculatePurchaseTotals(product, qty, rate, 0);
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

  const addItem = () => {
    setItems([
      ...items,
      {
        product: "",
        expiryDate: "",
        qty: "",
        rate: "",
        unit: "",
        taxableValue: 0,
        gst: 0,
        invoiceValue: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      vendorName: "",
      supplierInvoiceNumber: "",
      supplierInvoiceDate: "",
      discount: 0,
    });
    setItems([
      {
        product: "",
        expiryDate: "",
        qty: "",
        rate: "",
        unit: "",
        taxableValue: 0,
        gst: 0,
        invoiceValue: 0,
      },
    ]);
    setCalculations({
      taxableValue: 0,
      gst: 0,
      invoiceValue: 0,
      total: 0,
    });
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    // Navigate to purchase list page
    router.push("/dashboard/purchases");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const purchaseData = {
        vendorName: formData.vendorName,
        supplierInvoiceNumber: formData.supplierInvoiceNumber,
        supplierInvoiceDate: formData.supplierInvoiceDate,
        items: items.map((item) => ({
          product: item.product.toLowerCase(),
          expiryDate: item.expiryDate,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
          unit: item.unit,
          hsnCode: getProductDetails(item.product)?.hsnCode || "",
        })),
        discount: parseFloat(formData.discount) || 0,
        purchaseType: "Purchase",
      };

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessData(result);
        setShowSuccessModal(true);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create purchase invoice");
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      setError("Failed to create purchase invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Create Purchase Invoice
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Purchase Header */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name
                </label>
                <Select
                  options={vendors}
                  value={formData.vendorName}
                  onChange={(value) => handleInputChange("vendorName", value)}
                  placeholder="Select supplier..."
                  searchable={true}
                  required
                />
              </div>
            </div>
          </div>

          {/* Supplier Invoice Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Supplier Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Invoice Number
                </label>
                <Input
                  value={formData.supplierInvoiceNumber}
                  onChange={(e) =>
                    handleInputChange("supplierInvoiceNumber", e.target.value)
                  }
                  placeholder="Enter supplier invoice number"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Invoice Date
                </label>
                <Input
                  type="date"
                  value={formData.supplierInvoiceDate}
                  onChange={(e) =>
                    handleInputChange("supplierInvoiceDate", e.target.value)
                  }
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Items</h3>
              <Button
                type="button"
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                + Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const productDetails = getProductDetails(item.product);
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-medium text-gray-700">
                      Item {index + 1}
                    </h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-lg">
                        Remove Item
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product
                      </label>
                      <Select
                        options={getProductOptions()}
                        value={item.product}
                        onChange={(value) =>
                          handleItemChange(index, "product", value)
                        }
                        placeholder="Select product..."
                        searchable={true}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HSN Code
                      </label>
                      <Input
                        value={productDetails?.hsnCode || ""}
                        disabled
                        className="bg-gray-50 w-full"
                        placeholder="HSN Code"
                      />
                    </div>
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
                        placeholder="Qty"
                        min="0"
                        step="0.01"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <Select
                        options={UNITS.map((unit) => ({
                          value: unit,
                          label: unit,
                        }))}
                        value={item.unit}
                        onChange={(value) =>
                          handleItemChange(index, "unit", value)
                        }
                        placeholder="Unit"
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
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                        required
                        className="w-full"
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
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxable Value
                      </label>
                      <Input
                        value={`₹${item.taxableValue.toFixed(2)}`}
                        disabled
                        className="bg-white border-gray-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST
                      </label>
                      <Input
                        value={`₹${item.gst.toFixed(2)}`}
                        disabled
                        className="bg-white border-gray-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Value
                      </label>
                      <Input
                        value={`₹${item.invoiceValue.toFixed(2)}`}
                        disabled
                        className="bg-white border-gray-200 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Section */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Invoice Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Taxable Value
                </label>
                <Input
                  value={`₹${calculations.taxableValue.toFixed(2)}`}
                  disabled
                  className="bg-white border-gray-200 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total GST
                </label>
                <Input
                  value={`₹${calculations.gst.toFixed(2)}`}
                  disabled
                  className="bg-white border-gray-200 font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    handleInputChange("discount", e.target.value)
                  }
                  placeholder="Enter discount amount"
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Invoice Value
                </label>
                <Input
                  value={`₹${calculations.invoiceValue.toFixed(2)}`}
                  disabled
                  className="bg-white border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Total
                </label>
                <Input
                  value={`₹${calculations.total.toFixed(2)}`}
                  disabled
                  className="bg-green-100 border-green-300 text-green-800 font-bold text-lg"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 justify-end items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              className="px-8 py-3 rounded-lg">
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
              {loading ? "Creating..." : "Create Purchase Invoice"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Purchase Invoice Created Successfully!"
        message={
          successData
            ? `Purchase invoice ${
                successData.purchaseNumber
              } has been created successfully with a total amount of ₹${successData.total.toFixed(
                2
              )}.`
            : "Purchase invoice has been created successfully!"
        }
        confirmText="View Purchase List"
        onConfirm={handleSuccessModalConfirm}
      />
    </div>
  );
}
