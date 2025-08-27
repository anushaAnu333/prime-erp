# Invoice Printing Guide

This guide explains how to use the invoice printing functionality in the Prima ERP system.

## Features

### 1. Browser Print

- **Button**: "Print" button on the invoice view page
- **Functionality**: Opens a print-optimized view that automatically triggers the browser's print dialog
- **Output**: Prints the invoice without the sidebar and navigation elements
- **Format**: Optimized for A4 paper with proper margins and layout

### 2. PDF Download

- **Button**: "Download PDF" button on the invoice view page
- **Functionality**: Generates a high-quality PDF file using html2canvas and jsPDF
- **Output**: Downloads a PDF file named `Invoice-{invoiceNumber}.pdf`
- **Format**: Professional PDF with proper formatting and multiple page support

## How It Works

### Print CSS

The system includes print-specific CSS that:

- Hides the sidebar and navigation elements during printing
- Resets layout margins for full-width printing
- Optimizes fonts and colors for print output
- Ensures proper page breaks

### Company Information

The invoice automatically displays:

- Company name and address from the database
- GST number from company settings
- Proper formatting for Indian tax invoices

### Invoice Content

Each printed invoice includes:

- **Header**: Company details and invoice information
- **Customer Details**: Bill-to information
- **Invoice Summary**: Subtotal, GST, discounts, and final amount
- **Item Details**: Product table with quantities, rates, and totals
- **GST Breakdown**: Detailed GST calculations by rate
- **Terms & Conditions**: Standard business terms
- **Signature Spaces**: For customer and authorized signatures
- **Notes**: Any additional notes from the sale

## Technical Implementation

### Components

1. **PrintInvoice.jsx**: Handles browser printing with auto-print functionality
2. **PDFInvoice.jsx**: Generates downloadable PDF files
3. **companyUtils.js**: Manages company information with caching

### Dependencies

- `html2canvas`: Converts HTML to canvas for PDF generation
- `jspdf`: Creates PDF files from canvas data
- Built-in browser print functionality

### CSS Classes

- `.print-invoice`: Applied to print-optimized invoice view
- `.pdf-invoice`: Applied to PDF generation view
- Print media queries hide navigation elements

## Usage Instructions

1. Navigate to any sales invoice detail page
2. Click "Print" for browser printing or "Download PDF" for PDF file
3. For browser printing: Use browser print dialog to save as PDF or print
4. For PDF download: File will automatically download to your device

## Customization

### Company Details

Update company information in the database through the Company model:

- Company name
- Address
- GST number
- Contact information

### Print Layout

Modify the CSS in `app/globals.css` under the `@media print` section to customize:

- Page margins
- Font sizes
- Color schemes
- Element visibility

### Invoice Template

Edit the components in:

- `components/PrintInvoice.jsx` for browser printing
- `components/PDFInvoice.jsx` for PDF generation

## Troubleshooting

### Print Issues

- Ensure browser allows pop-ups for print functionality
- Check that CSS is properly loaded
- Verify company details are available in database

### PDF Generation Issues

- Check browser console for JavaScript errors
- Ensure html2canvas and jspdf libraries are loaded
- Verify invoice data is complete

### Company Information Not Showing

- Check company API endpoint (`/api/companies`)
- Verify company data exists in database
- Check network connectivity for API calls
