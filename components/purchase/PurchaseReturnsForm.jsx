"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import { calculatePurchaseTotals } from "../../lib/calculations";

const PRODUCTS = ["dosa", "idli", "chapati", "parata", "paneer", "green peas"];

export default function PurchaseReturnsForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    againstPurchaseId: "",
    vendorName: "",
    companyId: "PRIMA-SM",
    discount: 0,
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

  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([
    { value: "PRIMA-SM", label: "PRIMA Sales & Marketing" },
    { value: "PRIMA-FT", label: "PRIMA Food Trading" },
    { value: "PRIMA-EX", label: "PRIMA Export" },
  ]);
  const [existingPurchases, setExistingPurchases] = useState([]);
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });

  const [originalPurchase, setOriginalPurchase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch vendors and purchases on component mount
  useEffect(() => {
    fetchVendors();
    fetchPurchases();
  }, [formData.companyId]);

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
      const response = await fetch(
        `/api/vendors?company=${formData.companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setVendors(
          data?.map((vendor) => ({
            value: vendor.vendorName,
            label: `${vendor.vendorName} - ${vendor.contactPerson}`,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `/api/purchases?company=${formData.companyId}&type=Purchase&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        setExistingPurchases(
          data.purchases.map((purchase) => ({
            value: purchase._id,
            label: `${purchase.purchaseNumber} - ${
              purchase.vendorName
            } (${new Date(purchase.date).toLocaleDateString()})`,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAgainstPurchaseChange = async (purchaseId) => {
    setFormData((prev) => ({
      ...prev,
      againstPurchaseId: purchaseId,
    }));

    if (purchaseId) {
      try {
        const response = await fetch(`/api/purchases/${purchaseId}`);
        if (response.ok) {
          const purchase = await response.json();
          setOriginalPurchase(purchase);

          // Auto-fill vendor and company
          setFormData((prev) => ({
            ...prev,
            vendorName: purchase.vendorName,
            companyId: purchase.companyId,
          }));

          // Auto-fill items from original purchase
          const autoFilledItems = purchase.items.map((item) => ({
            product: item.product,
            expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
            qty: item.qty.toString(),
            rate: item.rate.toString(),
            taxableValue: item.taxableValue,
            gst: item.gst,
            invoiceValue: item.invoiceValue,
          }));

          setItems(autoFilledItems);
        }
      } catch (error) {
        console.error("Error fetching purchase details:", error);
      }
    } else {
      setOriginalPurchase(null);
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
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const returnData = {
        againstPurchaseId: formData.againstPurchaseId,
        vendorName: formData.vendorName,
        companyId: formData.companyId,
        items: items.map((item) => ({
          product: item.product,
          expiryDate: item.expiryDate,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
        })),
        discount: parseFloat(formData.discount) || 0,
      };

      const response = await fetch("/api/purchases/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Purchase return created successfully!");
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          againstPurchaseId: "",
          vendorName: "",
          companyId: "PRIMA-SM",
          discount: 0,
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
        setCalculations({
          taxableValue: 0,
          gst: 0,
          invoiceValue: 0,
          total: 0,
        });
        setOriginalPurchase(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create purchase return");
      }
    } catch (error) {
      console.error("Error creating purchase return:", error);
      setError("Failed to create purchase return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create Purchase Return
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Return Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Number
              </label>
              <Input value="Auto-generated" disabled className="bg-gray-50" />
            </div>
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
          </div>

          {/* Purchase Reference and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Against Purchase Order
              </label>
              <Select
                options={existingPurchases}
                value={formData.againstPurchaseId}
                onChange={handleAgainstPurchaseChange}
                placeholder="Select original purchase..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <Select
                options={companies}
                value={formData.companyId}
                onChange={(value) => handleInputChange("companyId", value)}
                required
              />
            </div>
          </div>

          {/* Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Select
                      options={PRODUCTS.map((product) => ({
                        value: product,
                        label: product,
                      }))}
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
                      placeholder="Enter return quantity"
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

          {/* Discount */}
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
                className="bg-red-50 border-red-200 text-red-800 font-semibold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
              {loading ? "Creating..." : "Create Purchase Return"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  date: new Date().toISOString().split("T")[0],
                  againstPurchaseId: "",
                  vendorName: "",
                  companyId: "PRIMA-SM",
                  discount: 0,
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
                setOriginalPurchase(null);
              }}
              className="px-6 py-3">
              Reset Form
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
