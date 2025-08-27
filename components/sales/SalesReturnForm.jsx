"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { calculateItemTotals } from "../../lib/calculations";

export default function SalesReturnForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalSales, setOriginalSales] = useState([]);
  const [originalSale, setOriginalSale] = useState(null);
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
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    againstSaleId: "",
    customerName: "",
    companyId: "PRIMA-SM",
    discount: 0,
  });

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
          const sale = await response.json();
          setOriginalSale(sale);

          // Auto-fill customer and company
          setFormData((prev) => ({
            ...prev,
            customerName: sale.customerName,
            companyId: sale.companyId,
          }));

          // Auto-fill items from original sale
          const autoFilledItems = sale.items.map((item) => ({
            product: item.product.toLowerCase(),
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
        console.error("Error fetching sale details:", error);
      }
    } else {
      setOriginalSale(null);
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
        againstSaleId: formData.againstSaleId,
        customerName: formData.customerName,
        companyId: formData.companyId,
        items: items.map((item) => ({
          product: item.product.toLowerCase(),
          expiryDate: item.expiryDate,
          qty: parseFloat(item.qty),
          rate: parseFloat(item.rate),
        })),
        discount: parseFloat(formData.discount) || 0,
      };

      const response = await fetch("/api/sales/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Sales return created successfully!");
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          againstSaleId: "",
          customerName: "",
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
        setOriginalSale(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create sales return");
      }
    } catch (error) {
      console.error("Error creating sales return:", error);
      setError("Failed to create sales return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create Sales Return
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

          {/* Against Sale Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Against Sale
              </label>
              <Select
                placeholder="Select Original Sale"
                options={originalSales.map((sale) => ({
                  value: sale._id,
                  label: `${sale.invoiceNo} - ${sale.customerName}`,
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
              />
            </div>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <Select
              options={[
                { value: "PRIMA-SM", label: "PRIMA-SM" },
                { value: "PRIMA-FT", label: "PRIMA-FT" },
                { value: "PRIMA-EX", label: "PRIMA-EX" },
              ]}
              value={formData.companyId}
              onChange={(value) => handleInputChange("companyId", value)}
              required
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Return Items
              </h3>
              <Button type="button" onClick={addItem} variant="outline">
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <Input
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <Input
                      value={item.invoiceValue.toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      disabled={items.length === 1}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Return"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
