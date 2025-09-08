"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import { calculatePurchaseTotals } from "../../lib/calculations";
import {
  createPurchaseReturn,
  selectPurchasesLoading,
  selectPurchasesError,
  clearError,
} from "@/lib/store/slices/purchasesSlice";

const PRODUCTS = ["dosa", "idli", "chapati", "parata", "paneer", "green peas"];

// Product HSN Code mapping
const PRODUCT_HSN_MAP = {
  "dosa": "1006",
  "idli": "1006", 
  "chapati": "1101",
  "parata": "1101",
  "paneer": "0406",
  "green peas": "0713"
};

// Valid units according to backend enum
const VALID_UNITS = ["kg", "piece", "dozen", "box"];

export default function PurchaseReturnsForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector(selectPurchasesLoading);
  const error = useSelector(selectPurchasesError);
  
  // Local state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [validationError, setValidationError] = useState("");
  
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split("T")[0],
    againstPurchaseId: "",
    vendorName: "",
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

  const [existingPurchases, setExistingPurchases] = useState([]);
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });

  const [originalPurchase, setOriginalPurchase] = useState(null);

  // Helper function to get HSN code for a product
  const getProductHSNCode = (productName) => {
    return PRODUCT_HSN_MAP[productName.toLowerCase()] || "1006";
  };

  // Fetch vendors and purchases on component mount
  useEffect(() => {
    fetchPurchases();
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


  const fetchPurchases = async () => {
    try {
      const response = await fetch(
        `/api/purchases?type=Purchase&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Purchases data received:', data.purchases); // Debug log
        
        setExistingPurchases(
          (data.purchases || []).map((purchase) => {
            // Handle different possible vendor name fields
            const vendorName = purchase.vendorName || 
                              purchase.vendor?.name || 
                              purchase.vendor?.vendorName ||
                              purchase.supplierName ||
                              'Unknown Vendor';
                              
            const purchaseNumber = purchase.purchaseNumber || 
                                 purchase.purchaseNo || 
                                 purchase.invoiceNumber ||
                                 'Unknown';
            
            return {
              value: purchase._id,
              label: `${purchaseNumber} - ${vendorName} (${new Date(purchase.date).toLocaleDateString()})`,
            };
          })
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
    handleInputChange("againstPurchaseId", purchaseId);

    if (purchaseId) {
      try {
        const response = await fetch(`/api/purchases/${purchaseId}`);
        if (response.ok) {
          const data = await response.json();
          // Handle both direct purchase object and wrapped response
          const purchase = data.purchase || data;
          
          console.log('Purchase data received:', purchase); // Debug log
          
          setOriginalPurchase(purchase);

          // Auto-fill vendor - handle different possible vendor name fields
          const vendorName = purchase.vendorName || 
                            purchase.vendor?.name || 
                            purchase.vendor?.vendorName ||
                            purchase.supplierName ||
                            "";
          
          setFormData((prev) => ({
            ...prev,
            vendorName: vendorName,
          }));

          // Auto-fill items from original purchase with proper error handling
          if (purchase.items && Array.isArray(purchase.items) && purchase.items.length > 0) {
            const autoFilledItems = purchase.items.map((item) => {
              const productName = (item.product || "").toLowerCase();
              const originalUnit = item.unit || "kg";
              const validUnit = VALID_UNITS.includes(originalUnit) ? originalUnit : "kg";
              
              return {
                product: productName,
                expiryDate: item.expiryDate 
                  ? new Date(item.expiryDate).toISOString().split("T")[0]
                  : "",
                qty: (item.qty || 0).toString(),
                rate: (item.rate || 0).toString(),
                unit: validUnit,
                taxableValue: item.taxableValue || 0,
                gst: item.gst || 0,
                invoiceValue: item.invoiceValue || 0,
              };
            });

            setItems(autoFilledItems);
          } else {
            console.warn('No items found in purchase or items is not an array:', purchase.items);
            // Keep default item if no items found
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
        } else {
          console.error('Failed to fetch purchase:', response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching purchase details:", error);
      }
    } else {
      setOriginalPurchase(null);
      setFormData((prev) => ({
        ...prev,
        vendorName: "",
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

  const resetForm = () => {
    setFormData({
      returnDate: new Date().toISOString().split("T")[0],
      againstPurchaseId: "",
      vendorName: "",
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
    setOriginalPurchase(null);
    setValidationError("");
  };

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    // Navigate to purchases list page
    router.push("/dashboard/purchases");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setValidationError("");

    // Validation checks
    if (!formData.againstPurchaseId) {
      setValidationError("Please select an original purchase order");
      console.error("Validation Error: Against Purchase ID is required");
      return;
    }

    if (!formData.vendorName) {
      setValidationError("Vendor name is required");
      console.error("Validation Error: Vendor name is required");
      return;
    }

    if (!items || items.length === 0) {
      setValidationError("At least one item is required");
      console.error("Validation Error: At least one item is required");
      return;
    }

    // Validate items
    const validItems = items.filter(item => {
      const hasProduct = item.product && item.product.trim() !== "";
      const hasValidQty = item.qty && parseFloat(item.qty) > 0;
      const hasValidRate = item.rate && parseFloat(item.rate) > 0;
      const hasValidUnit = item.unit && VALID_UNITS.includes(item.unit);
      
      return hasProduct && hasValidQty && hasValidRate;
    });

    if (validItems.length === 0) {
      setValidationError("Please ensure all items have valid product, quantity, and rate");
      console.error("Validation Error: No valid items found");
      return;
    }

    try {
      const returnData = {
        againstPurchaseId: formData.againstPurchaseId,
        vendorName: formData.vendorName,
        date: formData.returnDate,
        items: validItems.map((item) => {
          const productName = item.product.toLowerCase().trim();
          const hsnCode = PRODUCT_HSN_MAP[productName] || "1006"; // Default HSN code
          const validUnit = VALID_UNITS.includes(item.unit) ? item.unit : "kg"; // Ensure valid unit
          
          console.log(`Product: ${productName}, HSN: ${hsnCode}, Unit: ${validUnit}`);
          
          return {
            product: productName,
            expiryDate: item.expiryDate || new Date().toISOString().split('T')[0],
            qty: parseFloat(item.qty) || 0,
            rate: parseFloat(item.rate) || 0,
            unit: validUnit,
            hsnCode: hsnCode,
          };
        }),
        discount: parseFloat(formData.discount) || 0,
        notes: formData.notes || "",
      };

      console.log("Submitting purchase return data:", returnData);

      const result = await dispatch(createPurchaseReturn(returnData)).unwrap();
      
      setSuccessData(result);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      console.error("Error creating purchase return:", error);
      console.error("Error details:", error.message || error);
      // Error is already set in Redux state
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

        {validationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Original Purchase Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Original Purchase Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Vendor Name
                </label>
                <Input
                  value={formData.vendorName}
                  onChange={(e) => handleInputChange("vendorName", e.target.value)}
                  placeholder="Vendor name..."
                  required
                  disabled
                  className="bg-gray-50"
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
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Return Items</h3>
              <Button
                type="button"
                onClick={addItem}
                disabled
                className="bg-gray-400 text-white px-4 py-2 cursor-not-allowed">
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
                      disabled
                      className="bg-gray-400 text-white px-3 py-1 text-sm cursor-not-allowed">
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product
                    </label>
                    <Input
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                      placeholder="Product name..."
                      required
                      disabled
                      className="bg-gray-50"
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
                      className="bg-gray-50"
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
                      disabled
                      className="bg-gray-50"
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
                      className="bg-gray-50"
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
                disabled
                className="bg-gray-50"
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
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold">
              {loading ? "Creating..." : "Create Purchase Return"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Purchase Return Created Successfully!"
        message={
          successData
            ? `Purchase return ${
                successData.purchase?.purchaseNumber || "has been created"
              } successfully with a total amount of ₹${
                successData.purchase?.total?.toFixed(2) ||
                calculations.total.toFixed(2)
              }.`
            : "Purchase return has been created successfully!"
        }
        confirmText="View Purchases List"
        onConfirm={handleSuccessModalConfirm}
      />
    </div>
  );
}
