import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";
import Sale from "@/lib/models/Sale";
import Payment from "@/lib/models/Payment";

// Helper function to generate HTML report
function generateHTMLReport(reportData, filters, reportType) {
  const { summary, customers } = reportData;
  
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
                border-bottom: 2px solid #7c3aed;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #7c3aed;
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
                background-color: #faf5ff;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #7c3aed;
            }
            .summary-card h4 {
                margin: 0 0 5px 0;
                color: #6b21a8;
                font-size: 14px;
            }
            .summary-card .value {
                font-size: 20px;
                font-weight: bold;
                color: #581c87;
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
            .positive {
                color: #059669;
            }
            .negative {
                color: #dc2626;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
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
            <div class="filter-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h4>Total Customers</h4>
                <div class="value">${summary.totalCustomers}</div>
            </div>
            <div class="summary-card">
                <h4>Total Outstanding</h4>
                <div class="value">₹${summary.totalOutstanding.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Total Credit</h4>
                <div class="value">₹${summary.totalCredit.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <h4>Total Debit</h4>
                <div class="value">₹${summary.totalDebit.toLocaleString()}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Customer Name</th>
                    <th>Shop Name</th>
                    <th>Opening Balance</th>
                    <th>Total Sales</th>
                    <th>Total Returns</th>
                    <th>Total Payments</th>
                    <th>Current Balance</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(customer => `
                    <tr>
                        <td>${customer.customerId}</td>
                        <td>${customer.customerName}</td>
                        <td>${customer.shopName || 'N/A'}</td>
                        <td class="amount">₹${customer.openingBalance.toLocaleString()}</td>
                        <td class="amount">₹${customer.totalSales.toLocaleString()}</td>
                        <td class="amount">₹${customer.totalReturns.toLocaleString()}</td>
                        <td class="amount">₹${customer.totalPayments.toLocaleString()}</td>
                        <td class="amount ${customer.currentBalance >= 0 ? 'positive' : 'negative'}">₹${customer.currentBalance.toLocaleString()}</td>
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
  const { summary, customers } = reportData;
  
  let csv = 'Customer ID,Customer Name,Shop Name,Opening Balance,Total Sales,Total Returns,Total Payments,Current Balance\n';
  
  customers.forEach(customer => {
    csv += `"${customer.customerId}","${customer.customerName}","${customer.shopName || 'N/A'}","${customer.openingBalance}","${customer.totalSales}","${customer.totalReturns}","${customer.totalPayments}","${customer.currentBalance}"\n`;
  });
  
  return csv;
}

// GET /api/reports/customer-balance - Customer Balance Report
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || 'json';
    
    // Get all customers
    const customers = await Customer.find({ isActive: true }).sort({ name: 1 });
    
    // Calculate balance for each customer
    const customersData = await Promise.all(
      customers.map(async (customer) => {
        // Get sales for this customer
        const sales = await Sale.find({ 
          customerId: customer._id,
          type: 'Sale'
        });
        
        // Get returns for this customer
        const returns = await Sale.find({ 
          customerId: customer._id,
          type: 'Return'
        });
        
        // Get payments for this customer
        const payments = await Payment.find({ 
          customerId: customer._id
        });
        
        const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalReturns = returns.reduce((sum, ret) => sum + (ret.total || 0), 0);
        const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const openingBalance = customer.openingBalance || 0;
        
        const currentBalance = openingBalance + totalSales - totalReturns - totalPayments;
        
        return {
          customerId: customer.customerId,
          customerName: customer.name,
          shopName: customer.shopName,
          openingBalance,
          totalSales,
          totalReturns,
          totalPayments,
          currentBalance
        };
      })
    );
    
    // Calculate summary
    const summary = {
      totalCustomers: customersData.length,
      totalOutstanding: customersData.reduce((sum, customer) => 
        sum + (customer.currentBalance > 0 ? customer.currentBalance : 0), 0
      ),
      totalCredit: customersData.reduce((sum, customer) => 
        sum + (customer.currentBalance < 0 ? Math.abs(customer.currentBalance) : 0), 0
      ),
      totalDebit: customersData.reduce((sum, customer) => 
        sum + (customer.currentBalance > 0 ? customer.currentBalance : 0), 0
      )
    };
    
    const reportData = {
      summary,
      customers: customersData
    };
    
    const filters = {};
    
    // Handle different formats
    if (format === 'csv') {
      const csv = generateCSVReport(reportData, filters);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="customer-balance-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    if (format === 'pdf' || format === 'html') {
      const html = generateHTMLReport(reportData, filters, 'Customer Balance');
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="customer-balance-report-${new Date().toISOString().split('T')[0]}.html"`
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
      { message: "Failed to generate customer balance report" },
      { status: 500 }
    );
  }
}



