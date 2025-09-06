const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Helper function to generate PDF-ready HTML
const generatePDF = (data, title) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            color: #333; 
            font-size: 24px;
          }
          .header p { 
            margin: 5px 0 0 0; 
            color: #666; 
            font-size: 14px;
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 11px;
          }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            vertical-align: top;
          }
          .table th { 
            background-color: #f2f2f2; 
            font-weight: bold;
            color: #333;
          }
          .table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total { 
            font-weight: bold; 
            background-color: #e8e8e8; 
            color: #333;
          }
          .summary {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .summary h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #333;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            .table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        ${data}
      </body>
    </html>
  `;
  return htmlContent;
};

// Helper function to generate CSV
const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => `"${row[header] || ''}"`).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// Sales Report
router.get("/sales", async (req, res) => {
  try {
    const Sale = require("../models/Sale");
    
    const { 
      startDate, 
      endDate, 
      customerId, 
      type = 'Sale',
      format = 'json' 
    } = req.query;
    
    // Build query
    let query = { type };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    const sales = await Sale.find(query)
      .populate('customerId', 'name shopName')
      .sort({ date: -1 });
    
    // Calculate summary
    const summary = {
      totalSales: sales.length,
      totalAmount: sales.reduce((sum, sale) => sum + (sale.total || 0), 0),
      totalGST: sales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + (item.gst || 0), 0), 0
      ),
      averageSale: sales.length > 0 ? 
        sales.reduce((sum, sale) => sum + (sale.total || 0), 0) / sales.length : 0
    };
    
    const reportData = {
      summary,
      sales: sales.map(sale => ({
        invoiceNumber: sale.invoiceNo,
        date: sale.date,
        customerName: sale.customerName,
        customerShop: sale.shopName,
        total: sale.total,
        gst: sale.items.reduce((sum, item) => sum + (item.gst || 0), 0),
        items: sale.items.length,
        paymentStatus: sale.paymentStatus,
        deliveryStatus: sale.deliveryStatus
      }))
    };
    
    if (format === 'csv') {
      const headers = ['Invoice Number', 'Date', 'Customer Name', 'Shop Name', 'Total', 'GST', 'Items', 'Payment Status', 'Delivery Status'];
      const csvData = reportData.sales.map(sale => ({
        'Invoice Number': sale.invoiceNumber,
        'Date': new Date(sale.date).toLocaleDateString(),
        'Customer Name': sale.customerName,
        'Shop Name': sale.customerShop,
        'Total': sale.total,
        'GST': sale.gst,
        'Items': sale.items,
        'Payment Status': sale.paymentStatus,
        'Delivery Status': sale.deliveryStatus
      }));
      
      const csv = generateCSV(csvData, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }
    
    if (format === 'pdf') {
      const summaryHTML = `
        <div class="summary">
          <h3>Sales Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Sales:</span>
              <span>${summary.totalSales}</span>
            </div>
            <div class="summary-item">
              <span>Total Amount:</span>
              <span>₹${summary.totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total GST:</span>
              <span>₹${summary.totalGST.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Average Sale:</span>
              <span>₹${summary.averageSale.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
      
      const tableHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>GST</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.sales.map(sale => `
              <tr>
                <td>${sale.invoiceNumber}</td>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.customerName}</td>
                <td>₹${sale.total}</td>
                <td>₹${sale.gst}</td>
                <td>${sale.paymentStatus}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="3">Total</td>
              <td>₹${summary.totalAmount.toFixed(2)}</td>
              <td>₹${summary.totalGST.toFixed(2)}</td>
              <td>${summary.totalSales} Sales</td>
            </tr>
          </tfoot>
        </table>
      `;
      
      const pdf = generatePDF(summaryHTML + tableHTML, 'Sales Report');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.html"`);
      return res.send(pdf);
    }
    
    res.json({
      success: true,
      report: reportData,
      filters: { startDate, endDate, customerId, type }
    });
    
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
});

// Customer Balance Report
router.get("/customer-balance", async (req, res) => {
  try {
    const Sale = require("../models/Sale");
    const Customer = require("../models/Customer");
    
    const { format = 'json' } = req.query;
    
    // Get all customers
    const customers = await Customer.find({}).sort({ name: 1 });
    
    const customerBalances = await Promise.all(customers.map(async (customer) => {
      // Get all sales for this customer
      const sales = await Sale.find({ 
        customerId: customer._id,
        type: 'Sale'
      });
      
      // Get all returns for this customer
      const returns = await Sale.find({ 
        customerId: customer._id,
        type: 'Sale Return'
      });
      
      // Calculate opening balance (you can modify this logic based on your business rules)
      const openingBalance = 0; // This should be fetched from customer's opening balance field
      
      // Calculate total sales
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      
      // Calculate total returns
      const totalReturns = returns.reduce((sum, ret) => sum + (ret.total || 0), 0);
      
      // Calculate payments (you'll need to implement payment tracking)
      const totalPayments = 0; // This should be calculated from payment records
      
      // Calculate closing balance
      const closingBalance = openingBalance + totalSales - totalReturns - totalPayments;
      
      return {
        customerCode: customer.customerCode,
        customerName: customer.name,
        shopName: customer.shopName,
        phoneNumber: customer.phoneNumber,
        openingBalance,
        totalSales,
        totalReturns,
        totalPayments,
        closingBalance,
        salesCount: sales.length,
        returnsCount: returns.length
      };
    }));
    
    const summary = {
      totalCustomers: customerBalances.length,
      totalOpeningBalance: customerBalances.reduce((sum, cb) => sum + cb.openingBalance, 0),
      totalSales: customerBalances.reduce((sum, cb) => sum + cb.totalSales, 0),
      totalReturns: customerBalances.reduce((sum, cb) => sum + cb.totalReturns, 0),
      totalPayments: customerBalances.reduce((sum, cb) => sum + cb.totalPayments, 0),
      totalClosingBalance: customerBalances.reduce((sum, cb) => sum + cb.closingBalance, 0)
    };
    
    const reportData = {
      summary,
      customerBalances
    };
    
    if (format === 'csv') {
      const headers = ['Customer Code', 'Customer Name', 'Shop Name', 'Phone', 'Opening Balance', 'Sales', 'Returns', 'Payments', 'Closing Balance'];
      const csvData = customerBalances.map(cb => ({
        'Customer Code': cb.customerCode,
        'Customer Name': cb.customerName,
        'Shop Name': cb.shopName,
        'Phone': cb.phoneNumber,
        'Opening Balance': cb.openingBalance,
        'Sales': cb.totalSales,
        'Returns': cb.totalReturns,
        'Payments': cb.totalPayments,
        'Closing Balance': cb.closingBalance
      }));
      
      const csv = generateCSV(csvData, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customer-balance-report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }
    
    if (format === 'pdf') {
      const summaryHTML = `
        <div class="summary">
          <h3>Customer Balance Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Customers:</span>
              <span>${summary.totalCustomers}</span>
            </div>
            <div class="summary-item">
              <span>Total Opening Balance:</span>
              <span>₹${summary.totalOpeningBalance.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total Sales:</span>
              <span>₹${summary.totalSales.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total Returns:</span>
              <span>₹${summary.totalReturns.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total Payments:</span>
              <span>₹${summary.totalPayments.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total Closing Balance:</span>
              <span>₹${summary.totalClosingBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
      
      const tableHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>Opening Balance</th>
              <th>Sales</th>
              <th>Returns</th>
              <th>Payments</th>
              <th>Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            ${customerBalances.map(cb => `
              <tr>
                <td>${cb.customerCode}</td>
                <td>${cb.customerName}</td>
                <td>₹${cb.openingBalance}</td>
                <td>₹${cb.totalSales}</td>
                <td>₹${cb.totalReturns}</td>
                <td>₹${cb.totalPayments}</td>
                <td>₹${cb.closingBalance}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="2">Total</td>
              <td>₹${summary.totalOpeningBalance.toFixed(2)}</td>
              <td>₹${summary.totalSales.toFixed(2)}</td>
              <td>₹${summary.totalReturns.toFixed(2)}</td>
              <td>₹${summary.totalPayments.toFixed(2)}</td>
              <td>₹${summary.totalClosingBalance.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      `;
      
      const pdf = generatePDF(summaryHTML + tableHTML, 'Customer Balance Report');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="customer-balance-report-${new Date().toISOString().split('T')[0]}.html"`);
      return res.send(pdf);
    }
    
    res.json({
      success: true,
      report: reportData
    });
    
  } catch (error) {
    console.error("Error generating customer balance report:", error);
    res.status(500).json({ message: "Failed to generate customer balance report" });
  }
});

// Purchase Report
router.get("/purchases", async (req, res) => {
  try {
    const Purchase = require("../models/Purchase");
    
    const { 
      startDate, 
      endDate, 
      vendorName, 
      format = 'json' 
    } = req.query;
    
    // Build query
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (vendorName) {
      query.vendorName = new RegExp(vendorName, 'i');
    }
    
    const purchases = await Purchase.find(query)
      .sort({ date: -1 });
    
    // Calculate summary
    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0),
      totalGST: purchases.reduce((sum, purchase) => 
        sum + purchase.items.reduce((itemSum, item) => itemSum + (item.gst || 0), 0), 0
      ),
      averagePurchase: purchases.length > 0 ? 
        purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0) / purchases.length : 0
    };
    
    const reportData = {
      summary,
      purchases: purchases.map(purchase => ({
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.date,
        vendorName: purchase.vendorName,
        supplierInvoice: purchase.supplierInvoiceNumber,
        total: purchase.total,
        gst: purchase.items.reduce((sum, item) => sum + (item.gst || 0), 0),
        items: purchase.items.length,
        status: purchase.status,
        paymentStatus: purchase.paymentStatus
      }))
    };
    
    if (format === 'csv') {
      const headers = ['Purchase Number', 'Date', 'Vendor', 'Supplier Invoice', 'Total', 'GST', 'Items', 'Status', 'Payment Status'];
      const csvData = reportData.purchases.map(purchase => ({
        'Purchase Number': purchase.purchaseNumber,
        'Date': new Date(purchase.date).toLocaleDateString(),
        'Vendor': purchase.vendorName,
        'Supplier Invoice': purchase.supplierInvoice,
        'Total': purchase.total,
        'GST': purchase.gst,
        'Items': purchase.items,
        'Status': purchase.status,
        'Payment Status': purchase.paymentStatus
      }));
      
      const csv = generateCSV(csvData, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="purchase-report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }
    
    if (format === 'pdf') {
      const summaryHTML = `
        <div class="summary">
          <h3>Purchase Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Purchases:</span>
              <span>${summary.totalPurchases}</span>
            </div>
            <div class="summary-item">
              <span>Total Amount:</span>
              <span>₹${summary.totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Total GST:</span>
              <span>₹${summary.totalGST.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span>Average Purchase:</span>
              <span>₹${summary.averagePurchase.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
      
      const tableHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Purchase Number</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Supplier Invoice</th>
              <th>Total</th>
              <th>GST</th>
              <th>Items</th>
              <th>Status</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.purchases.map(purchase => `
              <tr>
                <td>${purchase.purchaseNumber}</td>
                <td>${new Date(purchase.date).toLocaleDateString()}</td>
                <td>${purchase.vendorName}</td>
                <td>${purchase.supplierInvoice || 'N/A'}</td>
                <td>₹${purchase.total}</td>
                <td>₹${purchase.gst}</td>
                <td>${purchase.items}</td>
                <td>${purchase.status}</td>
                <td>${purchase.paymentStatus}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4">Total</td>
              <td>₹${summary.totalAmount.toFixed(2)}</td>
              <td>₹${summary.totalGST.toFixed(2)}</td>
              <td>${summary.totalPurchases} Purchases</td>
              <td colspan="2">Average: ₹${summary.averagePurchase.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      `;
      
      const pdf = generatePDF(summaryHTML + tableHTML, 'Purchase Report');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="purchase-report-${new Date().toISOString().split('T')[0]}.html"`);
      return res.send(pdf);
    }
    
    res.json({
      success: true,
      report: reportData,
      filters: { startDate, endDate, vendorName }
    });
    
  } catch (error) {
    console.error("Error generating purchase report:", error);
    res.status(500).json({ message: "Failed to generate purchase report" });
  }
});

// Dashboard Summary Report
router.get("/dashboard", async (req, res) => {
  try {
    const Sale = require("../models/Sale");
    const Purchase = require("../models/Purchase");
    const Customer = require("../models/Customer");
    const Vendor = require("../models/Vendor");
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Today's sales
    const todaySales = await Sale.find({
      date: { $gte: startOfDay },
      type: 'Sale'
    });
    
    // Month's sales
    const monthSales = await Sale.find({
      date: { $gte: startOfMonth },
      type: 'Sale'
    });
    
    // Today's purchases
    const todayPurchases = await Purchase.find({
      date: { $gte: startOfDay }
    });
    
    // Month's purchases
    const monthPurchases = await Purchase.find({
      date: { $gte: startOfMonth }
    });
    
    const dashboardData = {
      sales: {
        today: {
          count: todaySales.length,
          amount: todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        },
        month: {
          count: monthSales.length,
          amount: monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
      },
      purchases: {
        today: {
          count: todayPurchases.length,
          amount: todayPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
        },
        month: {
          count: monthPurchases.length,
          amount: monthPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
        }
      },
      customers: {
        total: await Customer.countDocuments(),
        active: await Customer.countDocuments({ isActive: true })
      },
      vendors: {
        total: await Vendor.countDocuments(),
        active: await Vendor.countDocuments({ isActive: true })
      }
    };
    
    res.json({
      success: true,
      dashboard: dashboardData
    });
    
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    res.status(500).json({ message: "Failed to generate dashboard report" });
  }
});

// Product Expiry Report
router.get("/expiry", async (req, res) => {
  try {
    const Sale = require("../models/Sale");
    const Purchase = require("../models/Purchase");
    
    const { 
      days = 30, 
      format = 'json' 
    } = req.query;
    
    // Calculate expiry date threshold
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + parseInt(days));
    
    // Get all sales and purchases with items that have expiry dates
    const sales = await Sale.find({ type: 'Sale' });
    const purchases = await Purchase.find({});
    
    // Collect all items with expiry dates
    const expiringItems = [];
    
    // Process sales items
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.expiryDate && new Date(item.expiryDate) <= expiryThreshold) {
          expiringItems.push({
            type: 'Sale',
            invoiceNumber: sale.invoiceNo,
            date: sale.date,
            customerName: sale.customerName,
            product: item.product,
            qty: item.qty,
            expiryDate: item.expiryDate,
            daysToExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
            status: new Date(item.expiryDate) < new Date() ? 'Expired' : 'Expiring Soon'
          });
        }
      });
    });
    
    // Process purchase items
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (item.expiryDate && new Date(item.expiryDate) <= expiryThreshold) {
          expiringItems.push({
            type: 'Purchase',
            invoiceNumber: purchase.purchaseNumber,
            date: purchase.date,
            vendorName: purchase.vendorName,
            product: item.product,
            qty: item.qty,
            expiryDate: item.expiryDate,
            daysToExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
            status: new Date(item.expiryDate) < new Date() ? 'Expired' : 'Expiring Soon'
          });
        }
      });
    });
    
    // Sort by expiry date
    expiringItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    
    // Calculate summary
    const summary = {
      totalItems: expiringItems.length,
      expiredItems: expiringItems.filter(item => item.status === 'Expired').length,
      expiringSoonItems: expiringItems.filter(item => item.status === 'Expiring Soon').length,
      daysThreshold: parseInt(days)
    };
    
    const reportData = {
      summary,
      expiringItems
    };
    
    if (format === 'csv') {
      const headers = ['Type', 'Invoice Number', 'Date', 'Customer/Vendor', 'Product', 'Quantity', 'Expiry Date', 'Days to Expiry', 'Status'];
      const csvData = expiringItems.map(item => ({
        'Type': item.type,
        'Invoice Number': item.invoiceNumber,
        'Date': new Date(item.date).toLocaleDateString(),
        'Customer/Vendor': item.customerName || item.vendorName,
        'Product': item.product,
        'Quantity': item.qty,
        'Expiry Date': new Date(item.expiryDate).toLocaleDateString(),
        'Days to Expiry': item.daysToExpiry,
        'Status': item.status
      }));
      
      const csv = generateCSV(csvData, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="expiry-report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }
    
    if (format === 'pdf') {
      const summaryHTML = `
        <div class="summary">
          <h3>Product Expiry Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Total Items:</span>
              <span>${summary.totalItems}</span>
            </div>
            <div class="summary-item">
              <span>Expired Items:</span>
              <span>${summary.expiredItems}</span>
            </div>
            <div class="summary-item">
              <span>Expiring Soon:</span>
              <span>${summary.expiringSoonItems}</span>
            </div>
            <div class="summary-item">
              <span>Days Threshold:</span>
              <span>${summary.daysThreshold} days</span>
            </div>
          </div>
        </div>
      `;
      
      const tableHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Invoice</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Days to Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${expiringItems.map(item => `
              <tr>
                <td>${item.type}</td>
                <td>${item.invoiceNumber}</td>
                <td>${item.product}</td>
                <td>${item.qty}</td>
                <td>${new Date(item.expiryDate).toLocaleDateString()}</td>
                <td>${item.daysToExpiry}</td>
                <td>${item.status}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="3">Total Items</td>
              <td>${summary.totalItems}</td>
              <td colspan="2">Expired: ${summary.expiredItems}</td>
              <td>Expiring Soon: ${summary.expiringSoonItems}</td>
            </tr>
          </tfoot>
        </table>
      `;
      
      const pdf = generatePDF(summaryHTML + tableHTML, 'Product Expiry Report');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="expiry-report-${new Date().toISOString().split('T')[0]}.html"`);
      return res.send(pdf);
    }
    
    res.json({
      success: true,
      report: reportData
    });
    
  } catch (error) {
    console.error("Error generating expiry report:", error);
    res.status(500).json({ message: "Failed to generate expiry report" });
  }
});

module.exports = router;
