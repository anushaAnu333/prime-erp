"use client";

import { calculateInvoiceTotals, getGSTBreakdown } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

const InvoiceCalculations = ({ items = [], discount = 0, className = "" }) => {
  // Calculate totals
  const totals = calculateInvoiceTotals(items, discount);
  const gstBreakdown = getGSTBreakdown(items);

  // Calculate subtotal (sum of taxable values)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.taxableValue || 0),
    0
  );

  // Calculate total GST
  const totalGST = items.reduce((sum, item) => sum + (item.gst || 0), 0);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>Invoice Summary</span>
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Items Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Number of Items
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {items.length}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Subtotal
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        {/* GST Breakdown */}
        {Object.keys(gstBreakdown).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>GST Breakdown</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(gstBreakdown).map(([rate, breakdown]) => (
                <div
                  key={rate}
                  className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-700">
                      {rate}% GST
                    </span>
                    <span className="text-xs text-green-600">
                      ({formatCurrency(breakdown.taxableAmount)})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(breakdown.gstAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total GST */}
        {totalGST > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-green-700">
                Total GST
              </span>
            </div>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(totalGST)}
            </span>
          </div>
        )}

        {/* Invoice Value */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span className="text-sm font-medium text-blue-700">
              Invoice Value
            </span>
          </div>
          <span className="text-lg font-bold text-blue-700">
            {formatCurrency(totals.totalInvoiceValue)}
          </span>
        </div>

        {/* Discount */}
        {totals.discount > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="text-sm font-medium text-yellow-700">
                Discount ({discount}%)
              </span>
            </div>
            <span className="text-lg font-bold text-yellow-700">
              -{formatCurrency(totals.discount)}
            </span>
          </div>
        )}

        {/* Final Amount */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span className="text-lg font-bold text-white">Final Amount</span>
          </div>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(totals.total)}
          </span>
        </div>

        {/* Amount in Words */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Amount in words:
          </div>
          <div className="text-sm text-gray-600 font-mono">
            {totals.total > 0
              ? `Rupees ${numberToWords(totals.total)} only`
              : "Rupees Zero only"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple number to words conversion
function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  function convertLessThanOneThousand(n) {
    if (n === 0) return "";

    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    }
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "")
    );
  }

  function convert(n) {
    if (n === 0) return "Zero";
    if (n < 1) return "Zero";

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let result = "";

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + " Crore ";
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + " Lakh ";
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + " Thousand ";
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }

    return result.trim();
  }

  let result = convert(rupees);

  if (paise > 0) {
    result += " and " + convertLessThanOneThousand(paise) + " Paise";
  }

  return result;
}

export default InvoiceCalculations;
