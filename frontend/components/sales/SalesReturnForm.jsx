"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import { calculateItemTotals } from "../../lib/calculations";
import {
  createSalesReturn,
  selectSalesLoading,
  selectSalesError,
  clearError,
} from "@/lib/store/slices/salesSlice";

export default function SalesReturnForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector(selectSalesLoading);
  const error = useSelector(selectSalesError);
  
  // Local state
  const [originalSales, setOriginalSales] = useState([]);
  const [originalSale, setOriginalSale] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
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
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });

  const [products, setProducts] = useState([]);

  const UNITS = ["kg", "packet", "piece", "dozen", "box"];

  // Fetch products on component mount
  useEffect(() => {
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

    fetchProducts();
  }, []);

  const getProductDetails = (productName) => {
    return products.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );
  };

  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split("T")[0],
    againstSaleId: "",
    customerName: "",
    discount: 0,
  });

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

  // Fetch original sales for selection
  useEffect(() => {
    const fetchOriginalSales = async () => {
      try {
        const response = await fetch("/api/sales?type=Sale&limit=100");
        if (response.ok) {
          const data = await response.json();
          setOriginalSales(data.sales || []);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchOriginalSales();
  }, []);

  // Handle URL parameters for pre-selected sale
  useEffect(() => {
    if (typeof window !== 'undefined' && originalSales.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const preSelectedSaleId = urlParams.get('saleId');
      if (preSelectedSaleId) {
        // Find the sale in originalSales and select it
        const foundSale = originalSales.find(sale => sale._id === preSelectedSaleId);
        if (foundSale) {
          handleAgainstSaleChange(preSelectedSaleId);
        }
      }
    }
  }, [originalSales]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle against sale selection
  const handleAgainstSaleChange = async (saleId) => {
    handleInputChange("againstSaleId", saleId);

    if (saleId) {
      try {
        const response = await fetch(`/api/sales/${saleId}`);
        if (response.ok) {
          const data = await response.json();
          const sale = data.sale; // Extract sale from the response wrapper
          setOriginalSale(sale);

          // Auto-fill customer
          setFormData((prev) => ({
            ...prev,
            customerName: sale.customer.name,
          }));

          // Auto-fill items from original sale
          const autoFilledItems = sale.items.map((item) => ({
            product: item.product.toLowerCase(),
            expiryDate: new Date(item.expiryDate).toISOString().split("T")[0],
            qty: item.qty.toString(),
            rate: item.rate.toString(),
            unit: item.unit || "",
            taxableValue: item.taxableValue,
            gst: item.gst,
            invoiceValue: item.invoiceValue,
          }));

          setItems(autoFilledItems);
        }
      } catch (error) {
        console.error("Error fetching sale details:", error);
      }
    } else {
      setOriginalSale(null);
      setFormData((prev) => ({
        ...prev,
        customerName: "",
      }));
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
      returnDate: new Date().toISOString().split("T")[0],
      againstSaleId: "",
      customerName: "",
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
    setOriginalSale(null);
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    // Navigate to sales list page
    router.push("/dashboard/sales");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      const returnData = {
        againstSaleId: formData.againstSaleId,
        customerName: formData.customerName,
        date: formData.returnDate,
        items: items.map((item) => ({
          product: item.product.toLowerCase(),
          expiryDate: item.expiryDate,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
          unit: item.unit,
          hsnCode: getProductDetails(item.product)?.hsnCode || "",
        })),
        discount: parseFloat(formData.discount) || 0,
        notes: formData.notes || "",
      };

      const result = await dispatch(createSalesReturn(returnData)).unwrap();
      
      setSuccessData(result);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      console.error("Error creating sales return:", error);
      // Error is already set in Redux state
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Create Sales Return
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
          {/* Original Sale & Customer Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Original Sale Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Against Sale
                </label>
                <Select
                  placeholder="Select Original Sale"
                  options={originalSales.map((sale) => ({
                    value: sale._id,
                    label: `${sale.invoiceNumber} - ${sale.customer.name}`,
                  }))}
                  value={formData.againstSaleId}
                  onChange={handleAgainstSaleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  required
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </label>
                <Input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange("returnDate", e.target.value)}
                  required
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Return Items</h3>
              <Button
                type="button"
                onClick={addItem}
                disabled
                className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
                + Add Item
              </Button>
            </div>

            {items.map((item, index) => (
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
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 text-sm rounded-lg cursor-not-allowed">
                      Remove Item
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product
                    </label>
                    <Input
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                      placeholder="Enter product name..."
                      required
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <Input
                      value={getProductDetails(item.product)?.hsnCode || ""}
                      disabled
                      className="bg-gray-50 w-full"
                      placeholder="HSN Code"
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
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <Input
                      value={item.unit}
                      disabled
                      className="w-full bg-gray-50"
                      placeholder="Unit"
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
                      disabled
                      className="w-full bg-gray-50"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        Total Value
                      </label>
                      <Input
                        value={`₹${item.invoiceValue.toFixed(2)}`}
                        disabled
                        className="bg-white border-gray-200 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Return Summary
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
                  disabled
                  className="w-full bg-gray-50"
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

          {/* Notes */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Input
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes for the return..."
                disabled
                className="w-full bg-gray-50"
              />
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
              {loading ? "Creating..." : "Create Return"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Sales Return Created Successfully!"
        message={
          successData
            ? `Sales return ${
                successData.sale?.invoiceNumber || "has been created"
              } successfully with a total amount of ₹${
                successData.sale?.total?.toFixed(2) ||
                calculations.total.toFixed(2)
              }.`
            : "Sales return has been created successfully!"
        }
        confirmText="View Sales List"
        onConfirm={handleSuccessModalConfirm}
      />
    </div>
  );
}
