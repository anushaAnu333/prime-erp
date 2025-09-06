"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";
import Link from "next/link";

const DetailPage = ({
  title,
  data,
  fields = [],
  loading = false,
  error = null,
  onEdit,
  onDelete,
  editPath,
  deletePath,
  backPath,
  backText = "Back to List",
  showEdit = true,
  showDelete = true,
  showBack = false,
  className = "",
  emptyMessage = "No data found",
  children,
  actions = [],
  statusField = null,
  statusConfig = {
    active: { label: "Active", className: "bg-green-100 text-green-800" },
    inactive: { label: "Inactive", className: "bg-red-100 text-red-800" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  }
}) => {
  const formatValue = (value, field) => {
    if (value === null || value === undefined) return "N/A";
    
    switch (field.type) {
      case "date":
        return new Date(value).toLocaleDateString("en-IN");
      case "datetime":
        return new Date(value).toLocaleString("en-IN");
      case "currency":
        return Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(value);
      case "percentage":
        return `${value}%`;
      case "boolean":
        return value ? "Yes" : "No";
      case "status":
        const status = statusConfig[value] || { label: value, className: "bg-gray-100 text-gray-800" };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        );
      default:
        return value;
    }
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
            {backPath && (
              <Link href={backPath}>
                <Button variant="outline">{backText}</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{emptyMessage}</p>
            {backPath && (
              <Link href={backPath}>
                <Button variant="outline">{backText}</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex gap-2">
            {showBack && backPath && (
              <Link href={backPath}>
                <Button variant="outline">{backText}</Button>
              </Link>
            )}
            {showEdit && (editPath || onEdit) && (
              editPath ? (
                <Link href={editPath}>
                  <Button>Edit</Button>
                </Link>
              ) : (
                <Button onClick={onEdit}>Edit</Button>
              )
            )}
            {showDelete && (deletePath || onDelete) && (
              <Button 
                variant="danger" 
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "primary"}
                onClick={action.onClick}
                href={action.href}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {children ? (
          children
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className="space-y-4">
                {field.fields?.map((subField, subIndex) => (
                  <div key={subIndex}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {subField.label}
                    </label>
                    <p className={`text-lg ${subField.highlight ? 'font-semibold text-blue-600' : ''}`}>
                      {formatValue(data[subField.key], subField)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {statusField && data[statusField] && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {formatValue(data[statusField], { type: "status" })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DetailPage;
