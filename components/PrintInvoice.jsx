"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { getGSTBreakdown } from "@/lib/calculations";
import { getCompanyByCode, getDefaultCompany } from "@/lib/companyUtils";

const PrintInvoice = ({ sale, onClose }) => {
  const printRef = useRef(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    // Fetch company details
    const fetchCompanyDetails = async () => {
      try {
        // Try to get company from sale data, otherwise use default
        const companyCode = sale?.companyId || "PRIMA-SM";
        const company = await getCompanyByCode(companyCode);
        setCompanyDetails(company);
      } catch (error) {
        console.error("Error fetching company details:", error);
        const defaultCompany = await getDefaultCompany();
        setCompanyDetails(defaultCompany);
      }
    };

    fetchCompanyDetails();
  }, [sale]);

  useEffect(() => {
    // Auto-print when component mounts and company details are loaded
    if (companyDetails) {
      window.print();
    }

    // Close the print window after printing
    const handleAfterPrint = () => {
      if (onClose) onClose();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose, companyDetails]);

  if (!sale) return null;

  const gstBreakdown = getGSTBreakdown(sale.items);

  return (
    <div className="fixed inset-0 z-50 bg-white print-invoice" ref={printRef}>
      <div className="p-8 max-w-4xl mx-auto text-black">
        {/* Invoice Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                TAX INVOICE
              </h1>
              <div className="text-sm text-black">
                <p className="text-black">
                  <strong>Invoice No:</strong> {sale.invoiceNumber}
                </p>
                <p className="text-black">
                  <strong>Date:</strong>{" "}
                  {sale.invoiceDate
                    ? new Date(sale.invoiceDate).toLocaleDateString()
                    : "Invalid Date"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {companyDetails?.name || "Your Company Name"}
              </h2>
              <div className="text-sm text-black">
                <p className="text-black max-w-xs break-words">
                  {companyDetails?.address || "Company Address"}
                </p>
                <p className="text-black">
                  GSTIN: {companyDetails?.gstNumber || "YOUR_GSTIN_NUMBER"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Bill To */}
          <div>
            <h3 className="text-lg font-bold text-black mb-3 border-b border-gray-300 pb-1">
              Bill To:
            </h3>
            <div className="text-sm text-black">
              <p className="font-semibold text-black">
                {sale.customerDetails?.shopName}
              </p>
              <p className="text-black">{sale.customerDetails?.name}</p>
              <p className="text-black">{sale.customerDetails?.phone}</p>
              <p className="whitespace-pre-line text-black max-w-xs break-words">
                {sale.customerDetails?.address}
              </p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Invoice Summary:
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total GST:</span>
                <span>{formatCurrency(sale.totalGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice Value:</span>
                <span>{formatCurrency(sale.invoiceValue)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-1">
                <span>Final Amount:</span>
                <span>{formatCurrency(sale.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Item Details:
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold">
                  Product Description
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold">
                  Qty
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold">
                  Rate (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold">
                  Amount (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold">
                  GST ({sale.items[0]?.gstRate || 5}%)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold">
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {item.product}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {item.qty}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {formatCurrency(item.taxableValue)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {formatCurrency(item.gst)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">
                    {formatCurrency(item.invoiceValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Breakdown */}
        {Object.keys(gstBreakdown).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              GST Breakdown:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(gstBreakdown).map(([rate, data]) => (
                <div key={rate} className="border border-gray-300 p-3">
                  <div className="text-sm font-bold">{rate}% GST</div>
                  <div className="text-xs text-gray-600">
                    Taxable: {formatCurrency(data.taxableAmount)}
                  </div>
                  <div className="text-sm font-medium">
                    Tax: {formatCurrency(data.gstAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Terms & Conditions:
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Payment is due within 30 days of invoice date</p>
            <p>• Goods once sold will not be taken back</p>
            <p>• Interest will be charged on overdue payments</p>
            <p>• Subject to local jurisdiction</p>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-4">
              <p className="text-sm font-bold">Customer Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-4">
              <p className="text-sm font-bold">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale?.notes && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
            <h4 className="font-bold text-gray-900 mb-2">Notes:</h4>
            <p className="text-sm text-gray-700">{sale.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintInvoice;
