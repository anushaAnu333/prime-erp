"use client";

import { useRouter } from "next/navigation";
import BaseListComponent from "@/components/base/BaseListComponent";
import { formatCurrency } from "@/lib/utils";

const SalesListOptimized = () => {
  const router = useRouter();

  // Define columns for the sales list
  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      type: "date",
      sortable: true,
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
    },
    {
      key: "total",
      label: "Amount",
      type: "currency",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "paid" || value === "completed"
              ? "bg-green-100 text-green-800"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      placeholder: "Filter by Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "type",
      placeholder: "Filter by Type",
      options: [
        { value: "Sale", label: "Sale" },
        { value: "Return", label: "Return" },
      ],
    },
  ];

  // Define actions
  const actions = [
    {
      key: "view",
      label: "View",
      variant: "outline",
      path: "/dashboard/sales/:id",
    },
    {
      key: "edit",
      label: "Edit",
      variant: "outline",
      path: "/dashboard/sales/edit/:id",
    },
    {
      key: "print",
      label: "Print",
      variant: "outline",
      onClick: (item) => {
        window.open(`/dashboard/sales/${item._id}`, "_blank");
      },
    },
  ];

  // Handle row click
  const handleRowClick = (item) => {
    router.push(`/dashboard/sales/${item._id}`);
  };

  return (
    <BaseListComponent
      title="Sales Invoices"
      apiEndpoint="/api/sales"
      columns={columns}
      filters={filters}
      actions={actions}
      onRowClick={handleRowClick}
      searchPlaceholder="Search by invoice number, customer name..."
      createButtonText="Create Invoice"
      createButtonPath="/dashboard/sales/create"
      refreshInterval={30000} // Refresh every 30 seconds
    />
  );
};

export default SalesListOptimized;
