"use client";

import { formatCurrency } from "@/lib/utils";
import { getGSTBreakdown } from "@/lib/calculations";

const CalculationsDisplay = ({
  items = [],
  calculations = {},
  discount = 0,
  showGSTBreakdown = true,
  showItemCount = true,
  className = "",
  variant = "default", // "default", "compact", "detailed"
}) => {
  const gstBreakdown = getGSTBreakdown(items);
  const itemCount = items.filter(item => item.product && item.qty).length;

  const renderDefault = () => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
        {showItemCount && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                {itemCount}
              </span>
            </div>
          </div>
        )}

        {/* Basic Calculations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.taxableValue || 0)}
            </div>
            <div className="text-xs text-gray-600">Subtotal</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.gst || 0)}
            </div>
            <div className="text-xs text-gray-600">Total GST</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.invoiceValue || 0)}
            </div>
            <div className="text-xs text-gray-600">Invoice Value</div>
          </div>
          
          {discount > 0 && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                -{formatCurrency(discount)}
              </div>
              <div className="text-xs text-red-600">Discount</div>
            </div>
          )}
        </div>

        {/* Final Amount */}
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(calculations.total || 0)}
          </div>
          <div className="text-sm text-blue-600">Final Amount</div>
        </div>

        {/* GST Breakdown */}
        {showGSTBreakdown && Object.keys(gstBreakdown).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>GST Breakdown</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(gstBreakdown).map(([rate, data]) => (
                <div key={rate} className="border border-gray-200 p-3 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{rate}% GST</div>
                  <div className="text-xs text-gray-600">
                    Taxable: {formatCurrency(data.taxableAmount)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Tax: {formatCurrency(data.gstAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompact = () => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.taxableValue || 0)}
            </div>
            <div className="text-xs text-gray-600">Subtotal</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.gst || 0)}
            </div>
            <div className="text-xs text-gray-600">GST</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(calculations.invoiceValue || 0)}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(calculations.total || 0)}
            </div>
            <div className="text-xs text-blue-600">Final</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailed = () => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Summary</h3>
        
        <div className="space-y-6">
          {/* Item Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Items</h4>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.product}</div>
                    <div className="text-sm text-gray-600">
                      Qty: {item.qty} × Rate: {formatCurrency(item.rate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.invoiceValue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      GST: {formatCurrency(item.gst)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Calculations</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculations.taxableValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium">{formatCurrency(calculations.gst || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Invoice Value:</span>
                <span className="font-medium">{formatCurrency(calculations.invoiceValue || 0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Final Amount:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculations.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* GST Breakdown */}
          {showGSTBreakdown && Object.keys(gstBreakdown).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">GST Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(gstBreakdown).map(([rate, data]) => (
                  <div key={rate} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{rate}% GST</div>
                      <div className="text-sm text-gray-600">
                        Taxable: {formatCurrency(data.taxableAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(data.gstAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case "compact":
      return renderCompact();
    case "detailed":
      return renderDetailed();
    default:
      return renderDefault();
  }
};

export default CalculationsDisplay;
