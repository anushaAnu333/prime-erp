"use client";

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatCurrency } from "@/lib/utils";
import { getGSTBreakdown } from "@/lib/calculations";
import { getCompanyByCode, getDefaultCompany } from "@/lib/companyUtils";

const PDFInvoice = ({ sale, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    // Fetch company details
    const fetchCompanyDetails = async () => {
      try {
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
    // Auto-generate PDF when component mounts and company details are loaded
    if (sale && companyDetails && !isGenerating) {
      setIsGenerating(true);
      setTimeout(() => {
        generatePDF();
      }, 1000); // Wait for component to render
    }
  }, [sale, companyDetails]);

  const generatePDF = async () => {
    if (!pdfRef.current || !sale) return;

    try {
      console.log("Starting PDF generation...");

      // Create canvas from the PDF content
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794, // A4 width in pixels at 96 DPI
        height: pdfRef.current.scrollHeight, // Use actual content height
        logging: true, // Enable logging for debugging
        removeContainer: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: pdfRef.current.scrollHeight,
        foreignObjectRendering: false,
        imageTimeout: 15000,
      });

      console.log("Canvas created, generating PDF...");

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      console.log("PDF created, saving...");

      // Save the PDF
      pdf.save(`Invoice-${sale.invoiceNumber}.pdf`);

      console.log("PDF saved successfully");
      setIsGenerating(false);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setIsGenerating(false);
      if (onClose) onClose();
    }
  };

  if (!sale) return null;

  const gstBreakdown = getGSTBreakdown(sale.items);

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Generating PDF...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we prepare your invoice
        </p>
      </div>

      {/* PDF Content for Generation */}
      <div
        ref={pdfRef}
        className="bg-white p-8 border border-gray-300 text-black"
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          width: "794px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "1.4",
          color: "#000000",
          visibility: "visible",
          display: "block",
          zIndex: "9999",
        }}>
        {/* Invoice Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
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
              <h2 className="text-xl font-bold text-black mb-2 max-w-xs break-words">
                {companyDetails?.name || "Prima Sales & Marketing Pvt Ltd"}
              </h2>
              <div className="text-sm text-black">
                <p className="max-w-xs break-words">
                  {companyDetails?.address ||
                    "123 Business Street, City, State - 123456"}
                </p>
                <p className="text-black">
                  GSTIN: {companyDetails?.gstNumber || "12ABCDE1234F1Z5"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
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
            <h3 className="text-lg font-bold text-black mb-3 border-b border-gray-300 pb-1">
              Invoice Summary:
            </h3>
            <div className="text-sm space-y-1 text-black">
              <div className="flex justify-between text-black">
                <span className="text-black">Subtotal:</span>
                <span className="text-black">
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-black">
                <span className="text-black">Total GST:</span>
                <span className="text-black">
                  {formatCurrency(sale.totalGST)}
                </span>
              </div>
              <div className="flex justify-between text-black">
                <span className="text-black">Invoice Value:</span>
                <span className="text-black">
                  {formatCurrency(sale.invoiceValue)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-black">
                  <span className="text-black">Discount:</span>
                  <span className="text-black">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-1 text-black">
                <span className="text-black">Final Amount:</span>
                <span className="text-black">
                  {formatCurrency(sale.finalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black mb-3 border-b border-gray-300 pb-1">
            Item Details:
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold text-black">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-bold text-black">
                  Product Description
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-black">
                  Qty
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-black">
                  Rate (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-black">
                  Amount (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-black">
                  GST ({sale.items[0]?.gstRate || 5}%)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-black">
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-black">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-black max-w-xs break-words">
                    {item.product}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center text-black">
                    {item.qty}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right text-black">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right text-black">
                    {formatCurrency(item.taxableValue)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right text-black">
                    {formatCurrency(item.gst)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium text-black">
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
            <h3 className="text-lg font-bold text-black mb-3 border-b border-gray-300 pb-1">
              GST Breakdown:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(gstBreakdown).map(([rate, data]) => (
                <div key={rate} className="border border-gray-300 p-3">
                  <div className="text-sm font-bold text-black">
                    {rate}% GST
                  </div>
                  <div className="text-xs text-black">
                    Taxable: {formatCurrency(data.taxableAmount)}
                  </div>
                  <div className="text-sm font-medium text-black">
                    Tax: {formatCurrency(data.gstAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black mb-3 border-b border-gray-300 pb-1">
            Terms & Conditions:
          </h3>
          <div className="text-sm text-black space-y-1">
            <p className="text-black">
              • Payment is due within 30 days of invoice date
            </p>
            <p className="text-black">
              • Goods once sold will not be taken back
            </p>
            <p className="text-black">
              • Interest will be charged on overdue payments
            </p>
            <p className="text-black">• Subject to local jurisdiction</p>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-4">
              <p className="text-sm font-bold text-black">Customer Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-4">
              <p className="text-sm font-bold text-black">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale?.notes && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-300">
            <h4 className="font-bold text-black mb-2">Notes:</h4>
            <p className="text-sm text-black">{sale.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFInvoice;
