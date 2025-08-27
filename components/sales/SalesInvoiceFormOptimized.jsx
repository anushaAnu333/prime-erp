"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BaseInvoiceForm from "@/components/base/BaseInvoiceForm";
import FormField from "@/components/ui/FormField";
import CustomerSelect from "./CustomerSelect";
import ProductSelect from "./ProductSelect";
import CalculationsDisplay from "@/components/base/CalculationsDisplay";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useFormValidation } from "@/hooks/useFormValidation";
import { validationRules, patterns } from "@/hooks/useFormValidation";

const SalesInvoiceFormOptimized = ({
  initialData = null,
  mode = "create",
  onSave = null,
  onCancel = null,
}) => {
  const router = useRouter();
  
  // Use custom hooks
  const {
    formData,
    items,
    calculations,
    loading,
    error,
    handleInputChange,
    handleItemChange,
    addItem,
    removeItem,
    setLoading,
    setError,
    getPayload,
  } = useInvoiceForm(initialData, mode);

  const {
    errors,
    validateForm,
    validateSingleField,
    setFieldTouched,
    getFieldError,
    clearErrors,
  } = useFormValidation({
    customerId: validationRules.required,
    customerName: validationRules.required,
    date: validationRules.required,
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch customers and products
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    handleInputChange("customerId", customerId);
    handleInputChange("customerName", customer?.customerName || "");
    setFieldTouched("customerId");
    validateSingleField("customerId", customerId);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const payload = getPayload();
    const isValid = validateForm(payload);
    
    if (!isValid) {
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);
    setError("");
    clearErrors();

    try {
      const url = mode === "edit" ? `/api/sales/${initialData._id}` : "/api/sales";
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
        router.push("/dashboard/sales");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom form fields for sales invoice
  const renderCustomFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        type="select"
        label="Customer"
        name="customerId"
        value={formData.customerId}
        onChange={(e) => handleCustomerChange(e.target.value)}
        onBlur={() => setFieldTouched("customerId")}
        error={getFieldError("customerId")}
        required
        options={customers.map(customer => ({
          value: customer._id,
          label: customer.customerName
        }))}
        placeholder="Select a customer"
      />
      
      <FormField
        type="text"
        label="Customer Name"
        name="customerName"
        value={formData.customerName}
        onChange={(e) => handleInputChange("customerName", e.target.value)}
        onBlur={() => setFieldTouched("customerName")}
        error={getFieldError("customerName")}
        required
        readOnly
      />
      
      <FormField
        type="textarea"
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={(e) => handleInputChange("notes", e.target.value)}
        rows={3}
        placeholder="Additional notes..."
      />
    </div>
  );

  // Custom item fields with product selection
  const renderItemFields = (item, index) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField
        type="select"
        label="Product"
        value={item.product}
        onChange={(e) => handleItemChange(index, "product", e.target.value)}
        required
        options={products.map(product => ({
          value: product.name,
          label: product.name
        }))}
        placeholder="Select product"
      />
      
      <FormField
        type="date"
        label="Expiry Date"
        value={item.expiryDate}
        onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
        required
      />
      
      <FormField
        type="number"
        label="Quantity"
        value={item.qty}
        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
        min="1"
        required
      />
      
      <FormField
        type="number"
        label="Rate"
        value={item.rate}
        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
        min="0"
        step="0.01"
        required
      />
    </div>
  );

  // Custom calculations component
  const renderCalculations = () => (
    <CalculationsDisplay
      items={items}
      calculations={calculations}
      discount={formData.discount}
      variant="default"
    />
  );

  return (
    <BaseInvoiceForm
      type="invoice"
      mode={mode}
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
      title="Sales Invoice"
      apiEndpoint="/api/sales"
      redirectPath="/dashboard/sales"
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    >
      {renderCustomFields()}
      {renderItemFields}
      {renderCalculations}
    </BaseInvoiceForm>
  );
};

export default SalesInvoiceFormOptimized;
