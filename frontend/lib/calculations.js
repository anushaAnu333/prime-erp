/**
 * Utility functions for invoice calculations and GST handling
 * Based on Prima Sales & Marketing requirements
 */

import { v4 as uuidv4 } from "uuid";

// Product definitions with exact rates and GST from document
// Note: These are fallback values only. Products should be stored in database with HSN codes.
export const PRODUCTS = {
  dosa: { name: "dosa", rate: 25, gstRate: 5, unit: "packet" },
  idli: { name: "idli", rate: 20, gstRate: 5, unit: "packet" },
  chapati: { name: "chapati", rate: 30, gstRate: 5, unit: "packet" },
  parata: { name: "parata", rate: 35, gstRate: 5, unit: "packet" },
  paneer: { name: "paneer", rate: 300, gstRate: 12, unit: "kg" },
  "green peas": { name: "green peas", rate: 80, gstRate: 5, unit: "kg" },
  // Add capitalized versions for compatibility
  Dosa: { name: "Dosa", rate: 25, gstRate: 5, unit: "packet" },
  Idli: { name: "Idli", rate: 20, gstRate: 5, unit: "packet" },
  Chapati: { name: "Chapati", rate: 30, gstRate: 5, unit: "packet" },
  Parata: { name: "Parata", rate: 35, gstRate: 5, unit: "packet" },
  Paneer: { name: "Paneer", rate: 300, gstRate: 12, unit: "kg" },
  "Green peas": { name: "Green peas", rate: 80, gstRate: 5, unit: "kg" },
};

/**
 * Get product details by name (case-insensitive)
 * @param {string} productName - Product name
 * @returns {object} Product details
 */
export function getProductDetails(productName) {
  if (!productName) return null;

  // First try exact match
  if (PRODUCTS[productName]) {
    return PRODUCTS[productName];
  }

  // Then try case-insensitive match
  const lowerProductName = productName.toLowerCase();
  for (const [key, product] of Object.entries(PRODUCTS)) {
    if (key.toLowerCase() === lowerProductName) {
      return product;
    }
  }

  return null;
}

/**
 * Calculate GST amount for a given amount and rate
 * @param {number} amount - Taxable amount
 * @param {number} gstRate - GST rate (0, 5, 12, 18, 28)
 * @returns {number} GST amount
 */
export function calculateGST(amount, gstRate) {
  if (amount < 0 || gstRate < 0) return 0;
  return Math.round(amount * (gstRate / 100) * 100) / 100;
}

/**
 * Calculate total amount including GST
 * @param {number} amount - Base amount
 * @param {number} gstRate - GST rate
 * @returns {number} Total amount with GST
 */
export function calculateTotalWithGST(amount, gstRate) {
  const gstAmount = calculateGST(amount, gstRate);
  return Math.round((amount + gstAmount) * 100) / 100;
}

/**
 * Calculate item totals for Prima Sales requirements
 * @param {string|object} product - Product name or product object from database
 * @param {number} qty - Quantity
 * @param {number} rate - Rate per unit (optional, will use default if not provided)
 * @param {Date} expiryDate - Expiry date
 * @returns {object} Item calculations
 */
export function calculateItemTotals(
  product,
  qty,
  rate = null,
  expiryDate = null
) {
  let productDetails = null;

  // If product is an object (from database), use it directly
  if (typeof product === "object" && product !== null) {
    productDetails = {
      name: product.name,
      rate: product.rate,
      gstRate: product.gstRate,
      unit: product.unit,
      hsnCode: product.hsnCode,
    };
  } else {
    // If product is a string, try to get from hardcoded PRODUCTS
    productDetails = getProductDetails(product);
  }

  if (!productDetails) {
    throw new Error(`Invalid product: ${product}`);
  }

  const actualRate = rate || productDetails.rate;
  const taxableValue = Math.round(qty * actualRate * 100) / 100;
  const gst = calculateGST(taxableValue, productDetails.gstRate);
  const invoiceValue = Math.round((taxableValue + gst) * 100) / 100;

  return {
    product: typeof product === "string" ? product : product.name,
    expiryDate: expiryDate || new Date(),
    qty: qty,
    rate: actualRate,
    taxableValue: taxableValue,
    gst: gst,
    invoiceValue: invoiceValue,
    gstRate: productDetails.gstRate,
    unit: productDetails.unit,
    hsnCode: productDetails.hsnCode,
  };
}

/**
 * Calculate invoice totals from items
 * @param {Array} items - Array of invoice items
 * @param {number} discount - Discount percentage (default 5%)
 * @returns {object} Invoice calculations
 */
export function calculateInvoiceTotals(items, discount = 5) {
  let totalInvoiceValue = 0;

  items.forEach((item) => {
    totalInvoiceValue += item.invoiceValue || 0;
  });

  const discountAmount =
    Math.round(totalInvoiceValue * (discount / 100) * 100) / 100;
  const total = Math.round((totalInvoiceValue - discountAmount) * 100) / 100;

  return {
    totalInvoiceValue: Math.round(totalInvoiceValue * 100) / 100,
    discount: discountAmount,
    total: total,
  };
}

/**
 * Get GST breakdown by rate
 * @param {Array} items - Array of invoice items
 * @returns {object} GST breakdown by rate
 */
export function getGSTBreakdown(items) {
  const gstBreakdown = {};

  items.forEach((item) => {
    const rate = item.gstRate || 0;
    if (!gstBreakdown[rate]) {
      gstBreakdown[rate] = {
        taxableAmount: 0,
        gstAmount: 0,
      };
    }
    gstBreakdown[rate].taxableAmount += item.taxableValue || 0;
    gstBreakdown[rate].gstAmount += item.gst || 0;
  });

  // Round all values
  Object.keys(gstBreakdown).forEach((rate) => {
    gstBreakdown[rate].taxableAmount =
      Math.round(gstBreakdown[rate].taxableAmount * 100) / 100;
    gstBreakdown[rate].gstAmount =
      Math.round(gstBreakdown[rate].gstAmount * 100) / 100;
  });

  return gstBreakdown;
}

/**
 * Generate unique invoice number using UUID
 * @param {string} companyCode - Company code
 * @param {Date} date - Invoice date
 * @returns {string} Unique invoice number with UUID
 */
export function generateUniqueInvoiceNumber(companyCode, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Generate a short UUID (first 8 characters)
  const shortUuid = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

  // Format: PSM-2025-01-27-ABC12345
  return `${companyCode}-${dateStr}-${shortUuid}`;
}

/**
 * Generate invoice number by company (legacy function for backward compatibility)
 * @param {string} companyCode - Company code (PRIMA-SM, PRIMA-FT, etc.)
 * @param {Date} date - Invoice date
 * @param {number} sequence - Sequence number for the day
 * @returns {string} Generated invoice number
 */
export function generateInvoiceNumber(
  companyCode,
  date = new Date(),
  sequence = 1
) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(3, "0");

  // Format: PSM-2025-08-26-001
  return `${companyCode}-${year}-${month}-${day}-${seq}`;
}

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(number) {
  return new Intl.NumberFormat("en-IN").format(number);
}

/**
 * Validate GST rate
 * @param {number} rate - GST rate to validate
 * @returns {boolean} True if valid
 */
export function isValidGSTRate(rate) {
  return [0, 5, 12, 18, 28].includes(rate);
}

/**
 * Validate HSN code format
 * @param {string} hsnCode - HSN code to validate
 * @returns {boolean} True if valid
 */
export function isValidHSNCode(hsnCode) {
  return /^\d{4,8}$/.test(hsnCode);
}

/**
 * Validate GST number format
 * @param {string} gstNumber - GST number to validate
 * @returns {boolean} True if valid
 */
export function isValidGSTNumber(gstNumber) {
  if (!gstNumber) return true; // Optional field
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstNumber
  );
}

/**
 * Calculate CGST and SGST (for intrastate transactions)
 * @param {number} gstAmount - Total GST amount
 * @returns {object} CGST and SGST amounts
 */
export function calculateCGSTSGST(gstAmount) {
  const halfGST = gstAmount / 2;
  return {
    cgst: Math.round(halfGST * 100) / 100,
    sgst: Math.round(halfGST * 100) / 100,
  };
}

/**
 * Calculate IGST (for interstate transactions)
 * @param {number} gstAmount - Total GST amount
 * @returns {number} IGST amount
 */
export function calculateIGST(gstAmount) {
  return Math.round(gstAmount * 100) / 100;
}

/**
 * Validate invoice data for Prima Sales requirements
 * @param {object} invoiceData - Invoice data to validate
 * @returns {object} Validation result
 */
export function validateInvoiceData(invoiceData) {
  const errors = [];

  // Validate required fields
  if (!invoiceData.customerName) {
    errors.push("Customer name is required");
  }

  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push("At least one item is required");
  }

  // Validate items
  if (invoiceData.items) {
    invoiceData.items.forEach((item, index) => {
      if (!item.product) {
        errors.push(`Item ${index + 1}: Product is required`);
      }
      if (!PRODUCTS[item.product]) {
        errors.push(`Item ${index + 1}: Invalid product "${item.product}"`);
      }
      if (!item.qty || item.qty <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.expiryDate) {
        errors.push(`Item ${index + 1}: Expiry date is required`);
      }
    });
  }

  // Validate discount
  if (
    invoiceData.discount &&
    (invoiceData.discount < 0 || invoiceData.discount > 100)
  ) {
    errors.push("Discount must be between 0 and 100 percent");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get all available products for dropdown
 * @returns {Array} Array of product objects for dropdown
 */
export function getProductOptions() {
  return Object.entries(PRODUCTS).map(([key, product]) => ({
    value: key,
    label: `${product.name} - ₹${product.rate}/${product.unit}`,
    ...product,
  }));
}

/**
 * Calculate purchase totals for Prima Sales requirements
 * @param {string|object} product - Product name or product object from database
 * @param {number} qty - Quantity
 * @param {number} rate - Purchase rate per unit
 * @param {number} discount - Discount amount (default 0)
 * @returns {object} Purchase calculations
 */
export function calculatePurchaseTotals(product, qty, rate, discount = 0) {
  let productDetails = null;

  // If product is an object (from database), use it directly
  if (typeof product === "object" && product !== null) {
    productDetails = {
      name: product.name,
      rate: product.rate,
      gstRate: product.gstRate,
      unit: product.unit,
      hsnCode: product.hsnCode,
    };
  } else {
    // If product is a string, try to get from hardcoded PRODUCTS
    productDetails = getProductDetails(product);
  }

  if (!productDetails) {
    throw new Error(`Invalid product: ${product}`);
  }

  const taxableValue = Math.round(qty * rate * 100) / 100;
  const gst = calculateGST(taxableValue, productDetails.gstRate);
  const invoiceValue = Math.round((taxableValue + gst) * 100) / 100;
  const total = Math.round((invoiceValue - discount) * 100) / 100;

  return {
    taxableValue,
    gst,
    invoiceValue,
    total,
    gstRate: productDetails.gstRate,
    unit: productDetails.unit,
    hsnCode: productDetails.hsnCode,
  };
}

/**
 * Get product GST rate
 * @param {string|object} product - Product name or product object from database
 * @returns {number} GST rate
 */
export function getProductGSTRate(product) {
  let productDetails = null;

  // If product is an object (from database), use it directly
  if (typeof product === "object" && product !== null) {
    return product.gstRate || 0;
  } else {
    // If product is a string, try to get from hardcoded PRODUCTS
    productDetails = getProductDetails(product);
    return productDetails ? productDetails.gstRate : 0;
  }
}

/**
 * Generate unique purchase number using UUID
 * @param {Date} date - Purchase date
 * @returns {string} Unique purchase number with UUID
 */
export function generatePurchaseNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  // Generate a short UUID (first 8 characters)
  const shortUuid = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();

  // Format: PUR-2025-08-26-A1B2C3D4
  return `PUR-${dateStr}-${shortUuid}`;
}

/**
 * Generate vendor code
 * @returns {string} Generated vendor code
 */
export function generateVendorCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `VEND${timestamp}${random}`;
}

/**
 * Validate purchase data
 * @param {object} purchaseData - Purchase data to validate
 * @returns {object} Validation result
 */
export function validatePurchaseData(purchaseData) {
  const errors = [];

  // Validate required fields
  if (!purchaseData.vendorName) {
    errors.push("Vendor name is required");
  }

  // Supplier invoice fields are optional for now
  // if (!purchaseData.supplierInvoiceNumber) {
  //   errors.push("Supplier invoice number is required");
  // }

  // if (!purchaseData.supplierInvoiceDate) {
  //   errors.push("Supplier invoice date is required");
  // }

  if (!purchaseData.items || purchaseData.items.length === 0) {
    errors.push("At least one item is required");
  }

  // Validate items
  if (purchaseData.items) {
    purchaseData.items.forEach((item, index) => {
      if (!item.product) {
        errors.push(`Item ${index + 1}: Product is required`);
      }
      const productDetails = getProductDetails(item.product);
      if (!productDetails) {
        errors.push(`Item ${index + 1}: Invalid product "${item.product}"`);
      }
      if (!item.qty || item.qty <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.rate || item.rate <= 0) {
        errors.push(`Item ${index + 1}: Rate must be greater than 0`);
      }
      if (!item.unit) {
        errors.push(`Item ${index + 1}: Unit is required`);
      }
      if (!item.expiryDate) {
        errors.push(`Item ${index + 1}: Expiry date is required`);
      }
    });
  }

  // Validate discount
  if (purchaseData.discount && purchaseData.discount < 0) {
    errors.push("Discount cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
