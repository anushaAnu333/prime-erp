import { useState, useEffect } from "react";
import { calculateItemTotals } from "@/lib/calculations";

export const useInvoiceForm = (initialData = null, mode = "create") => {
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    notes: "",
  });

  // Items state
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

  // Calculations state
  const [calculations, setCalculations] = useState({
    taxableValue: 0,
    gst: 0,
    invoiceValue: 0,
    total: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Form handlers
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

  const updateItem = (index, updatedItem) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    setItems(updatedItems);
  };

  const clearForm = () => {
    setFormData({
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
    setError("");
  };

  const validateForm = () => {
    const errors = [];

    // Validate basic fields
    if (!formData.date) {
      errors.push("Date is required");
    }

    // Validate items
    const validItems = items.filter((item) => item.product && item.qty && item.rate);
    if (validItems.length === 0) {
      errors.push("At least one item is required");
    }

    // Validate individual items
    items.forEach((item, index) => {
      if (item.product && (!item.qty || !item.rate)) {
        errors.push(`Item ${index + 1}: Quantity and rate are required`);
      }
    });

    return errors;
  };

  const getPayload = () => {
    return {
      ...formData,
      items: items.filter((item) => item.product && item.qty && item.rate),
      total: calculations.total,
      totalGST: calculations.gst,
      subtotal: calculations.taxableValue,
    };
  };

  return {
    // State
    formData,
    items,
    calculations,
    loading,
    error,

    // Setters
    setFormData,
    setItems,
    setLoading,
    setError,

    // Handlers
    handleInputChange,
    handleItemChange,
    addItem,
    removeItem,
    updateItem,
    clearForm,

    // Utilities
    validateForm,
    getPayload,
  };
};
