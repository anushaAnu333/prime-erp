"use client";

import React from "react";
import Link from "next/link";

// Reusable Action Icons Component
export const ActionIcons = ({
  viewPath,
  editPath,
  onDelete,
  deleteConfirmMessage = "Are you sure you want to delete this item?",
  showView = true,
  showEdit = true,
  showDelete = true,
  size = "sm",
  skipConfirm = false, // New prop to skip built-in confirmation
}) => {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = size === "sm" ? "p-1" : "p-1.5";

  return (
    <div className="flex gap-1">
      {showView && viewPath && (
        <Link href={viewPath}>
          <button
            className={`${buttonSize} text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors`}>
            <svg
              className={iconSize}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </Link>
      )}
      {showEdit && editPath && (
        <Link href={editPath}>
          <button
            className={`${buttonSize} text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors`}>
            <svg
              className={iconSize}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </Link>
      )}
      {showDelete && onDelete && (
        <button
          onClick={() => {
            if (skipConfirm) {
              onDelete();
            } else if (confirm(deleteConfirmMessage)) {
              onDelete();
            }
          }}
          className={`${buttonSize} text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors`}>
          <svg
            className={iconSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const Table = ({
  columns = [],
  data = [],
  className = "",
  onRowClick = null,
  loading = false,
  emptyMessage = "No data available",
  emptyIcon = null,
  striped = true,
  hoverable = true,
  sortable = false,
  onSort = null,
  currentSort = null,
  sortDirection = "asc",
}) => {
  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-100">
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="px-6 py-12 text-center">
          {emptyIcon || (
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {emptyMessage}
          </h3>
        </div>
      </div>
    );
  }

  const handleSort = (columnKey) => {
    if (sortable && onSort) {
      const newDirection =
        currentSort === columnKey && sortDirection === "asc" ? "desc" : "asc";
      onSort(columnKey, newDirection);
    }
  };

  const getSortIcon = (columnKey) => {
    if (!sortable || currentSort !== columnKey) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === "asc" ? (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.className || ""}
                    ${
                      sortable && column.sortable !== false
                        ? "cursor-pointer hover:bg-gray-100"
                        : ""
                    }
                  `}
                  onClick={() =>
                    sortable &&
                    column.sortable !== false &&
                    handleSort(column.key)
                  }>
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortable &&
                      column.sortable !== false &&
                      getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                className={`
                  ${onRowClick ? "cursor-pointer" : ""}
                  ${hoverable ? "hover:bg-gray-50" : ""}
                  ${striped && rowIndex % 2 === 1 ? "bg-gray-50" : ""}
                  ${row.className || ""}
                `}>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-gray-900
                      ${column.cellClassName || ""}
                    `}>
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
