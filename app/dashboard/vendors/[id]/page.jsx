"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";

export default function VendorDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVendor(data.vendor);
      } else {
        setError("Vendor not found");
      }
    } catch (error) {
      setError("Failed to fetch vendor details");
    } finally {
      setLoading(false);
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
            <Link href="/dashboard/vendors">
              <Button variant="outline">Back to Vendors</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vendor not found</p>
            <Link href="/dashboard/vendors">
              <Button variant="outline">Back to Vendors</Button>
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
          <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/vendors">
              <Button variant="outline">Back to List</Button>
            </Link>
            <Link href={`/dashboard/vendors/edit/${vendor._id}`}>
              <Button>Edit Vendor</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Code
              </label>
              <p className="text-lg font-semibold text-blue-600">
                {vendor.vendorCode}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <p className="text-lg">{vendor.vendorName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <p className="text-lg">{vendor.contactPerson}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <p className="text-lg">{vendor.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <p
                className={`text-lg font-semibold ${
                  vendor.currentBalance > 0 ? "text-red-600" : "text-green-600"
                }`}>
                {formatCurrency(vendor.currentBalance)}
              </p>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <p className="text-lg">{vendor.paymentTerms}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Date
              </label>
              <p className="text-lg">{formatDate(vendor.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-lg">{vendor.email || "Not provided"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
              {vendor.gstNumber}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <p className="text-lg bg-gray-50 p-3 rounded-lg">
              {vendor.address}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
