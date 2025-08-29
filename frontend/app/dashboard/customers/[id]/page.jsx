"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";
import PaymentForm from "../../../../components/PaymentForm";
import PaymentHistory from "../../../../components/PaymentHistory";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchCustomer();
    fetchPaymentData();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);

        // Fetch company details if assigned
        if (data.customer.companyId) {
          const companyResponse = await fetch(`/api/companies`);
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            const assignedCompany = companyData.companies.find(
              (c) => c.companyCode === data.customer.companyId
            );
            setCompany(assignedCompany);
          }
        }
      } else {
        setError("Customer not found");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      setError("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setSales(data.sales || []);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
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
    // Refresh payment data and customer data
    fetchPaymentData();
    fetchCustomer();
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
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/customers">
              <Button variant="outline">Back to List</Button>
            </Link>
            <Button
              onClick={() => setShowPaymentForm(true)}
              className="bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
            <Link href={`/dashboard/customers/edit/${customer._id}`}>
              <Button>Edit Customer</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Code
              </label>
              <p className="text-lg font-semibold text-blue-600">
                {customer.customerCode}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <p className="text-lg">{customer.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name
              </label>
              <p className="text-lg">{customer.shopName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <p className="text-lg">{customer.phoneNumber}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <p
                className={`text-lg font-semibold ${
                  customer.currentBalance > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}>
                {formatCurrency(customer.currentBalance)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Company
              </label>
              <p className="text-lg">
                {company ? company.name : "Not Assigned"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Date
              </label>
              <p className="text-lg">{formatDate(customer.createdAt)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-lg">{formatDate(customer.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <p className="text-lg bg-gray-50 p-3 rounded-lg">
            {customer.address}
          </p>
        </div>
      </Card>

      {/* Payment Summary Section */}
      {summary && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Financial Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(summary.totalSales)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.totalPayments)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Outstanding Amount</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(summary.outstandingAmount)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p
                className={`text-lg font-semibold ${
                  summary.currentBalance > 0 ? "text-red-600" : "text-green-600"
                }`}>
                {formatCurrency(summary.currentBalance)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment History Section */}
      <Card className="p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Transaction History
        </h3>
        <PaymentHistory payments={payments} sales={sales} />
      </Card>

      {/* Payment Form Modal */}
      <PaymentForm
        customer={customer}
        onPaymentSuccess={handlePaymentSuccess}
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
      />
    </div>
  );
}
