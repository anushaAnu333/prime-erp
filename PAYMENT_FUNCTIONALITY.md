# Payment Functionality Documentation

## Overview

The payment functionality has been integrated directly into the customer detail page, allowing users to record payments and view transaction history without navigating to a separate page.

## Features Implemented

### 1. Payment Recording

- **Location**: Customer detail page (`/dashboard/customers/[id]`)
- **Access**: "Record Payment" button in the customer detail page header
- **Modal Form**: Clean, user-friendly payment form with the following fields:
  - Amount (required)
  - Payment Mode (Cash, Online, Cheque, Bank Transfer)
  - Payment Date (defaults to current date)
  - Reference Number (optional)
  - Notes (optional)

### 2. Financial Summary Dashboard

- **Total Sales**: Sum of all sales invoices for the customer
- **Total Payments**: Sum of all payments received from the customer
- **Outstanding Amount**: Net sales minus net payments
- **Current Balance**: Real-time customer balance (updated automatically)

### 3. Transaction History

- **Tabbed Interface**: Toggle between Payment History and Sales History
- **Payment History**: Shows all payment transactions from both Payment model and Sales invoices with:
  - Date, Amount, Payment Mode, Source (Payment Model/Sales Invoice), Invoice No, Reference, Notes
- **Sales History**: Shows all sales invoices with:
  - Date, Invoice No, Amount, Payment Status, Total Payments, Type, Delivery Status

### 4. Automatic Balance Updates

- When a payment is recorded, the customer's current balance is automatically updated
- Balance calculation: `currentBalance = currentBalance - paymentAmount`
- Supports both "Payment Received" and "Payment Refund" types
- **Dual Payment Sources**: Payments can be recorded through:
  - Standalone Payment model (for general payments)
  - Sales invoice payment array (for invoice-specific payments)

## Database Schema

### Payment Model (`models/Payment.js`)

```javascript
{
  customerId: ObjectId (ref: Customer),
  customerName: String,
  amount: Number,
  paymentMode: String (enum: Cash, Online, Cheque, Bank Transfer),
  paymentDate: Date,
  referenceNumber: String,
  notes: String,
  companyId: String,
  relatedSaleIds: [ObjectId],
  type: String (enum: Payment Received, Payment Refund)
}
```

### Sales Model Payment Array (`models/Sale.js`)

```javascript
{
  // ... other fields
  paymentStatus: String (enum: Pending, Partial, Paid),
  payments: [{
    paymentMode: String (enum: Cash, Online, Cheque, Bank Transfer),
    amountPaid: Number,
    paymentDate: Date,
    referenceNumber: String,
    notes: String
  }]
}
```

## API Endpoints

### 1. Create Payment

- **POST** `/api/payments`
- **Body**: Payment details (customerId, amount, paymentMode, etc.)
- **Response**: Created payment object with success message

### 2. Get Customer Payments & Summary

- **GET** `/api/customers/[id]/payments`
- **Response**: Customer details, payments array, sales array, and summary object

### 3. List Payments (with filters)

- **GET** `/api/payments?customerId=xxx&companyId=xxx`
- **Response**: Array of payments with optional filtering

### 4. Add Payment to Sales Invoice

- **POST** `/api/sales/[id]/add-payment`
- **Body**: Payment details (paymentMode, amountPaid, paymentDate, referenceNumber, notes)
- **Response**: Updated sale object with new payment added

## Components Created

### 1. PaymentForm (`components/PaymentForm.jsx`)

- Modal-based payment form
- Form validation and error handling
- Automatic form reset after successful submission

### 2. PaymentHistory (`components/PaymentHistory.jsx`)

- Tabbed interface for payment and sales history
- Table display with proper formatting
- Empty state handling

## Integration Points

### Customer Detail Page Updates

- Added "Record Payment" button
- Integrated financial summary section
- Added transaction history section
- Real-time data refresh after payment recording

### Existing Sales Integration

- Payment functionality works with existing sales system
- **Updated Sales Model**: Replaced individual payment fields with a `payments` array
- Each payment in the array includes: paymentMode, amountPaid, paymentDate, referenceNumber, notes
- Payment status is automatically calculated based on total payments vs invoice total
- Payment records can be linked to specific sales via `relatedSaleIds`

## Usage Instructions

1. **Navigate to Customer Detail Page**

   - Go to `/dashboard/customers`
   - Click on any customer to view details

2. **Record a Payment**

   - Click the "Record Payment" button
   - Fill in the payment details
   - Click "Record Payment" to save

3. **View Transaction History**

   - Scroll down to the "Transaction History" section
   - Switch between "Payment History" and "Sales History" tabs
   - View detailed transaction information

4. **Monitor Financial Summary**
   - View real-time financial summary at the top of the page
   - Track outstanding amounts and current balance

## Benefits

1. **Streamlined Workflow**: No need to navigate to separate payment pages
2. **Real-time Updates**: Customer balance updates immediately after payment
3. **Comprehensive View**: All customer financial information in one place
4. **Audit Trail**: Complete transaction history for each customer
5. **User-friendly Interface**: Clean, intuitive design with proper error handling

## Future Enhancements

1. **Bulk Payment Processing**: Record multiple payments at once
2. **Payment Reminders**: Automated reminders for outstanding payments
3. **Payment Reports**: Generate payment reports by date range
4. **Payment Reconciliation**: Match payments with specific invoices
5. **Payment Analytics**: Track payment patterns and trends
