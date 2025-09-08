import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/lib/models/Stock";
import Product from "@/lib/models/Product";

// Helper function to generate HTML report
function generateHTMLReport(reportData, filters, reportType) {
  const { summary, products } = reportData;
  
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
                border-bottom: 2px solid #dc2626;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #dc2626;
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
                background-color: #fef2f2;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #dc2626;
            }
            .summary-card h4 {
                margin: 0 0 5px 0;
                color: #b91c1c;
                font-size: 14px;
            }
            .summary-card .value {
                font-size: 20px;
                font-weight: bold;
                color: #991b1b;
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
            .expired {
                background-color: #fef2f2;
                color: #dc2626;
            }
            .expiring-soon {
                background-color: #fef3c7;
                color: #d97706;
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
            .status.expired {
                background-color: #fef2f2;
                color: #dc2626;
            }
            .status.expiring-soon {
                background-color: #fef3c7;
                color: #d97706;
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
            ${filters.days ? `<div class="filter-item"><strong>Days to Expiry:</strong> ${filters.days} days</div>` : ''}
            <div class="filter-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h4>Total Products</h4>
                <div class="value">${summary.totalProducts}</div>
            </div>
            <div class="summary-card">
                <h4>Expired Products</h4>
                <div class="value">${summary.expiredProducts}</div>
            </div>
            <div class="summary-card">
                <h4>Expiring Soon</h4>
                <div class="value">${summary.expiringSoon}</div>
            </div>
            <div class="summary-card">
                <h4>Total Value at Risk</h4>
                <div class="value">₹${summary.totalValueAtRisk.toLocaleString()}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Batch Number</th>
                    <th>Current Stock</th>
                    <th>Expiry Date</th>
                    <th>Days to Expiry</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr class="${product.daysToExpiry < 0 ? 'expired' : product.daysToExpiry <= 30 ? 'expiring-soon' : ''}">
                        <td>${product.productCode}</td>
                        <td>${product.productName}</td>
                        <td>${product.batchNumber || 'N/A'}</td>
                        <td class="amount">${product.currentStock}</td>
                        <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
                        <td class="amount">${product.daysToExpiry}</td>
                        <td class="amount">₹${product.unitPrice.toLocaleString()}</td>
                        <td class="amount">₹${product.totalValue.toLocaleString()}</td>
                        <td><span class="status ${product.daysToExpiry < 0 ? 'expired' : product.daysToExpiry <= 30 ? 'expiring-soon' : ''}">${product.status}</span></td>
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
  const { summary, products } = reportData;
  
  let csv = 'Product Code,Product Name,Batch Number,Current Stock,Expiry Date,Days to Expiry,Unit Price,Total Value,Status\n';
  
  products.forEach(product => {
    csv += `"${product.productCode}","${product.productName}","${product.batchNumber || 'N/A'}","${product.currentStock}","${new Date(product.expiryDate).toLocaleDateString()}","${product.daysToExpiry}","${product.unitPrice}","${product.totalValue}","${product.status}"\n`;
  });
  
  return csv;
}

// GET /api/reports/expiry - Product Expiry Report
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days")) || 30;
    const format = searchParams.get("format") || 'json';
    
    const today = new Date();
    const expiryThreshold = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Get all stock entries with expiry dates
    const stockEntries = await Stock.find({
      expiryDate: { $exists: true, $ne: null },
      currentStock: { $gt: 0 }
    }).populate('productId', 'productCode name unitPrice');
    
    // Filter and process products
    const productsData = stockEntries
      .filter(stock => stock.expiryDate <= expiryThreshold)
      .map(stock => {
        const daysToExpiry = Math.ceil((stock.expiryDate - today) / (1000 * 60 * 60 * 24));
        const totalValue = stock.currentStock * (stock.productId?.unitPrice || 0);
        
        let status = 'Good';
        if (daysToExpiry < 0) {
          status = 'Expired';
        } else if (daysToExpiry <= 30) {
          status = 'Expiring Soon';
        }
        
        return {
          productCode: stock.productId?.productCode || 'N/A',
          productName: stock.productId?.name || 'N/A',
          batchNumber: stock.batchNumber,
          currentStock: stock.currentStock,
          expiryDate: stock.expiryDate,
          daysToExpiry,
          unitPrice: stock.productId?.unitPrice || 0,
          totalValue,
          status
        };
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
    
    // Calculate summary
    const summary = {
      totalProducts: productsData.length,
      expiredProducts: productsData.filter(p => p.daysToExpiry < 0).length,
      expiringSoon: productsData.filter(p => p.daysToExpiry >= 0 && p.daysToExpiry <= 30).length,
      totalValueAtRisk: productsData.reduce((sum, product) => sum + product.totalValue, 0)
    };
    
    const reportData = {
      summary,
      products: productsData
    };
    
    const filters = { days };
    
    // Handle different formats
    if (format === 'csv') {
      const csv = generateCSVReport(reportData, filters);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expiry-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    if (format === 'pdf' || format === 'html') {
      const html = generateHTMLReport(reportData, filters, 'Product Expiry');
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="expiry-report-${new Date().toISOString().split('T')[0]}.html"`
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
      { message: "Failed to generate expiry report" },
      { status: 500 }
    );
  }
}



