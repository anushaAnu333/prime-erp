import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";

// Helper function to generate HTML report
function generateHTMLReport(reportData, filters, reportType) {
  const { summary, purchases } = reportData;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportType} Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #ea580c;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #ea580c;
                margin-bottom: 5px;
            }
            .report-title {
                font-size: 18px;
                color: #666;
            }
            .filters {
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .filters h3 {
                margin: 0 0 10px 0;
                color: #374151;
            }
            .filter-item {
                display: inline-block;
                margin-right: 20px;
                margin-bottom: 5px;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            .summary-card {
                background-color: #fff7ed;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ea580c;
            }
            .summary-card h4 {
                margin: 0 0 5px 0;
                color: #c2410c;
                font-size: 14px;
            }
            .summary-card .value {
                font-size: 20px;
                font-weight: bold;
                color: #9a3412;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #f3f4f6;
                font-weight: bold;
                color: #374151;
            }
            tr:nth-child(even) {
                background-color: #f9fafb;
            }
            .amount {
                text-align: right;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
            }
            .status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status.completed {
                background-color: #dcfce7;
                color: #166534;
            }
            .status.pending {
                background-color: #fef3c7;
                color: #92400e;
            }
            .status.paid {
                background-color: #dcfce7;
                color: #166534;
            }
            .status.unpaid {
                background-color: #fef3c7;
                color: #92400e;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">Prime ERP</div>
            <div class="report-title">${reportType} Report</div>
        </div>
        
        <div class="filters">
            <h3>Report Filters</h3>
            ${filters.startDate ? `<div class="filter-item"><strong>Start Date:</strong> ${new Date(filters.startDate).toLocaleDateString()}</div>` : ''}
            ${filters.endDate ? `<div class="filter-item"><strong>End Date:</strong> ${new Date(filters.endDate).toLocaleDateString()}</div>` : ''}
            ${filters.vendorName ? `<div class="filter-item"><strong>Vendor Name:</strong> ${filters.vendorName}</div>` : ''}
            <div class="filter-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h4>Total Purchases</h4>
                <div class="value">${summary.totalPurchases}</div>
            </div>
            <div class="summary-card">
                <h4>Total Amount</h4>
                <div class="value">₹${summary.totalAmount.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Total Taxable Value</h4>
                <div class="value">₹${summary.totalTaxableValue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Total GST</h4>
                <div class="value">₹${summary.totalGST.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Average Purchase</h4>
                <div class="value">₹${summary.averagePurchase.toLocaleString()}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Purchase No.</th>
                    <th>Date</th>
                    <th>Vendor Name</th>
                    <th>Supplier Invoice</th>
                    <th>Taxable Value</th>
                    <th>GST</th>
                    <th>Total Amount</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                </tr>
            </thead>
            <tbody>
                ${purchases.map(purchase => `
                    <tr>
                        <td>${purchase.purchaseNumber}</td>
                        <td>${new Date(purchase.date).toLocaleDateString()}</td>
                        <td>${purchase.vendorName}</td>
                        <td>${purchase.supplierInvoice || 'N/A'}</td>
                        <td class="amount">₹${purchase.taxableValue.toLocaleString()}</td>
                        <td class="amount">₹${purchase.gst.toLocaleString()}</td>
                        <td class="amount">₹${purchase.total.toLocaleString()}</td>
                        <td>${purchase.items}</td>
                        <td><span class="status ${purchase.status.toLowerCase()}">${purchase.status}</span></td>
                        <td><span class="status ${purchase.paymentStatus.toLowerCase()}">${purchase.paymentStatus}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="footer">
            <p>This report was generated on ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
  `;
  
  return html;
}

// Helper function to generate CSV report
function generateCSVReport(reportData, filters) {
  const { summary, purchases } = reportData;
  
  let csv = 'Purchase No.,Date,Vendor Name,Supplier Invoice,Taxable Value,GST,Total Amount,Items,Status,Payment Status\n';
  
  purchases.forEach(purchase => {
    csv += `"${purchase.purchaseNumber}","${new Date(purchase.date).toLocaleDateString()}","${purchase.vendorName}","${purchase.supplierInvoice || 'N/A'}","${purchase.taxableValue}","${purchase.gst}","${purchase.total}","${purchase.items}","${purchase.status}","${purchase.paymentStatus}"\n`;
  });
  
  return csv;
}

// GET /api/reports/purchases - Purchase Report
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vendorName = searchParams.get("vendorName");
    const format = searchParams.get("format") || 'json';
    
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
    
    // Calculate detailed summary with taxable value and GST
    let totalAmount = 0;
    let totalGST = 0;
    let totalTaxableValue = 0;
    
    const purchasesData = purchases.map(purchase => {
      const purchaseGST = purchase.items.reduce((sum, item) => sum + (item.gst || 0), 0);
      const purchaseTaxableValue = (purchase.total || 0) - purchaseGST;
      
      totalAmount += purchase.total || 0;
      totalGST += purchaseGST;
      totalTaxableValue += purchaseTaxableValue;
      
      return {
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.date,
        vendorName: purchase.vendorName,
        supplierInvoice: purchase.supplierInvoiceNumber,
        taxableValue: purchaseTaxableValue,
        gst: purchaseGST,
        total: purchase.total,
        items: purchase.items.length,
        status: purchase.status,
        paymentStatus: purchase.paymentStatus
      };
    });
    
    const summary = {
      totalPurchases: purchases.length,
      totalAmount,
      totalTaxableValue,
      totalGST,
      averagePurchase: purchases.length > 0 ? totalAmount / purchases.length : 0
    };
    
    const reportData = {
      summary,
      purchases: purchasesData
    };
    
    const filters = { startDate, endDate, vendorName };
    
    // Handle different formats
    if (format === 'csv') {
      const csv = generateCSVReport(reportData, filters);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="purchases-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    if (format === 'pdf' || format === 'html') {
      const html = generateHTMLReport(reportData, filters, 'Purchase');
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="purchases-report-${new Date().toISOString().split('T')[0]}.html"`
        }
      });
    }
    
    // Default JSON response
    return NextResponse.json({
      success: true,
      report: reportData,
      filters
    });
    
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate purchase report" },
      { status: 500 }
    );
  }
}
