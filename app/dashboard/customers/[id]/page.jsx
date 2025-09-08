"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSales } from "../../../../lib/store/slices/salesSlice";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";
import PaymentForm from "../../../../components/PaymentForm";
import PaymentHistory from "../../../../components/PaymentHistory";

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useDispatch();
  const { sales, loading: salesLoading, error: salesError } = useSelector((state) => state.sales);
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchCustomer();
    fetchTransactions();
  }, [id]);

  // Process sales data when it changes
  useEffect(() => {
    if (sales && sales.length > 0) {
      
      // Transform sales data to individual payment transactions
      const allTransactions = [];
      
      sales.forEach(sale => {
        
        const totalAmount = sale.finalAmount || sale.total || 0;
        
        // If sale has payments, create individual payment transactions
        if (sale.payments && Array.isArray(sale.payments) && sale.payments.length > 0) {
          sale.payments.forEach((payment, index) => {
            const transaction = {
              id: `${sale._id || sale.id}_payment_${payment._id || index}`,
              saleId: sale._id || sale.id,
              invoiceNumber: sale.invoiceNumber || sale.invoiceNo,
              saleDate: sale.invoiceDate || sale.date || sale.createdAt,
              paymentDate: payment.paymentDate,
              paymentMode: payment.paymentMode,
              totalAmount: totalAmount,
              amountPaid: payment.amountPaid || 0,
              referenceNumber: payment.referenceNumber || '',
              notes: payment.notes || '',
              paymentStatus: sale.paymentStatus || 'Pending',
              deliveryStatus: sale.deliveryStatus || 'Pending',
              type: 'payment'
            };
            allTransactions.push(transaction);
          });
        } else {
          // If no payments, don't create a transaction entry
          // Only actual payments should appear in the payment history
          // Pending sales will be shown in the sales summary but not in payment history
        }
      });
      
      // Sort transactions by payment date (most recent first)
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.saleDate);
        const dateB = new Date(b.paymentDate || b.saleDate);
        return dateB - dateA;
      });
      
      setTransactions(allTransactions);
      
      // Calculate summary statistics from original sales data
      const totalSales = sales.length;
      const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.finalAmount || sale.total || 0), 0);
      const totalPaidAmount = allTransactions
        .filter(t => t.type === 'payment')
        .reduce((sum, transaction) => sum + transaction.amountPaid, 0);
      const totalBalanceAmount = totalSalesAmount - totalPaidAmount;
      
      const summaryData = {
        totalSales,
        totalSalesAmount,
        totalPaidAmount,
        totalBalanceAmount
      };
      
      setSummary(summaryData);
    } else {
      setTransactions([]);
      setSummary(null);
    }
  }, [sales]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Customer not found");
      }
    } catch (error) {
      setError("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Fetch sales for this customer using Redux
      await dispatch(fetchSales({ 
        customerId: id, 
        limit: 100 
      })).unwrap();
    } catch (error) {
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const handlePaymentSuccess = (payment) => {
    // Refresh customer data and transactions
    fetchCustomer();
    fetchTransactions();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard/customers">
              <Button variant="outline">Back to Customers</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Customer not found</p>
            <Link href="/dashboard/customers">
              <Button variant="outline">Back to Customers</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">ID: {customer.customerCode}</p>
        </div>
      
      </div>

      {/* Customer Info */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Shop Name</label>
              <p className="text-gray-900">{customer.shopName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-gray-900">{customer.phoneNumber}</p>
            </div>
            {customer.email && (
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{customer.email}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-gray-900">{customer.address}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Current Balance</label>
              <p className={`text-xl font-semibold ${
                customer.currentBalance > 0 ? "text-red-600" : "text-green-600"
              }`}>
                {formatCurrency(customer.currentBalance)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <p className="text-gray-900">{formatDate(customer.updatedAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sales Summary */}
      {summary && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.totalSales}</p>
              <p className="text-sm text-gray-600">Total Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalSalesAmount)}</p>
              <p className="text-sm text-gray-600">Sales Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalPaidAmount)}</p>
              <p className="text-sm text-gray-600">Amount Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalBalanceAmount)}</p>
              <p className="text-sm text-gray-600">Outstanding</p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Transactions</h3>
          
          {salesLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
        ) : salesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {salesError}</p>
            <Button onClick={fetchTransactions} variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reference/Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.length > 0 ? transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link 
                        href={`/dashboard/sales/${transaction.saleId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {transaction.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.paymentDate ? formatDate(transaction.paymentDate) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.paymentMode ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.paymentMode === 'Cash' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.paymentMode === 'Online'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.paymentMode}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {transaction.amountPaid > 0 ? formatCurrency(transaction.amountPaid) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="space-y-1">
                        {transaction.referenceNumber && (
                          <div className="font-medium">Ref: {transaction.referenceNumber}</div>
                        )}
                        {transaction.notes && (
                          <div className="text-gray-500">{transaction.notes}</div>
                        )}
                        {!transaction.referenceNumber && !transaction.notes && (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No payment transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
