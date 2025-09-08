import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/lib/models/Sale";

// Helper function to generate HTML report
function generateHTMLReport(reportData, filters, reportType) {
  const { summary, sales } = reportData;
  
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
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
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
                background-color: #f0f9ff;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            .summary-card h4 {
                margin: 0 0 5px 0;
                color: #1e40af;
                font-size: 14px;
            }
            .summary-card .value {
                font-size: 20px;
                font-weight: bold;
                color: #1e3a8a;
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
            .status.paid {
                background-color: #dcfce7;
                color: #166534;
            }
            .status.pending {
                background-color: #fef3c7;
                color: #92400e;
            }
            .status.delivered {
                background-color: #dcfce7;
                color: #166534;
            }
            .status.pending-delivery {
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
            ${filters.customerId ? `<div class="filter-item"><strong>Customer ID:</strong> ${filters.customerId}</div>` : ''}
            <div class="filter-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h4>Total Sales</h4>
                <div class="value">${summary.totalSales}</div>
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
                <h4>Average Sale</h4>
                <div class="value">₹${summary.averageSale.toLocaleString()}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Shop Name</th>
                    <th>Taxable Value</th>
                    <th>GST</th>
                    <th>Total Amount</th>
                    <th>Items</th>
                    <th>Payment Status</th>
                    <th>Delivery Status</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => `
                    <tr>
                        <td>${sale.invoiceNumber}</td>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.customerName || 'N/A'}</td>
                        <td>${sale.customerShop || 'N/A'}</td>
                        <td class="amount">₹${sale.taxableValue.toLocaleString()}</td>
                        <td class="amount">₹${sale.gst.toLocaleString()}</td>
                        <td class="amount">₹${sale.total.toLocaleString()}</td>
                        <td>${sale.items}</td>
                        <td><span class="status ${sale.paymentStatus.toLowerCase().replace(' ', '-')}">${sale.paymentStatus}</span></td>
                        <td><span class="status ${sale.deliveryStatus.toLowerCase().replace(' ', '-')}">${sale.deliveryStatus}</span></td>
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
  const { summary, sales } = reportData;
  
  let csv = 'Invoice No.,Date,Customer Name,Shop Name,Taxable Value,GST,Total Amount,Items,Payment Status,Delivery Status\n';
  
  sales.forEach(sale => {
    csv += `"${sale.invoiceNumber}","${new Date(sale.date).toLocaleDateString()}","${sale.customerName || 'N/A'}","${sale.customerShop || 'N/A'}","${sale.taxableValue}","${sale.gst}","${sale.total}","${sale.items}","${sale.paymentStatus}","${sale.deliveryStatus}"\n`;
  });
  
  return csv;
}

// GET /api/reports/sales - Sales Report
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");
    const type = searchParams.get("type") || 'Sale';
    const format = searchParams.get("format") || 'json';
    
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
    
    // Calculate detailed summary with taxable value and GST
    let totalAmount = 0;
    let totalGST = 0;
    let totalTaxableValue = 0;
    
    const salesData = sales.map(sale => {
      const saleGST = sale.items.reduce((sum, item) => sum + (item.gst || 0), 0);
      const saleTaxableValue = (sale.total || 0) - saleGST;
      
      totalAmount += sale.total || 0;
      totalGST += saleGST;
      totalTaxableValue += saleTaxableValue;
      
      return {
        invoiceNumber: sale.invoiceNo,
        date: sale.date,
        customerName: sale.customerName,
        customerShop: sale.shopName,
        taxableValue: saleTaxableValue,
        gst: saleGST,
        total: sale.total,
        items: sale.items.length,
        paymentStatus: sale.paymentStatus,
        deliveryStatus: sale.deliveryStatus
      };
    });
    
    const summary = {
      totalSales: sales.length,
      totalAmount,
      totalTaxableValue,
      totalGST,
      averageSale: sales.length > 0 ? totalAmount / sales.length : 0
    };
    
    const reportData = {
      summary,
      sales: salesData
    };
    
    const filters = { startDate, endDate, customerId, type };
    
    // Handle different formats
    if (format === 'csv') {
      const csv = generateCSVReport(reportData, filters);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    if (format === 'pdf' || format === 'html') {
      const html = generateHTMLReport(reportData, filters, 'Sales');
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.html"`
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
      { message: "Failed to generate sales report" },
      { status: 500 }
    );
  }
}
