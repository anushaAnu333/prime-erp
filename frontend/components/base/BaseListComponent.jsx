"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

const BaseListComponent = ({
  title = "List",
  apiEndpoint = "",
  columns = [],
  filters = [],
  actions = [],
  onRowClick = null,
  searchPlaceholder = "Search...",
  createButtonText = "Create New",
  createButtonPath = "",
  refreshInterval = 0, // 0 = no auto refresh
  customRowRenderer = null,
  customFilters = null,
  customActions = null,
}) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        sortField,
        sortDirection,
        ...filters,
      });

      const response = await fetch(`${apiEndpoint}?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setData(result.data || result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [currentPage, pageSize, searchTerm, sortField, sortDirection, filters]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Handle row click
  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Handle action
  const handleAction = (action, item) => {
    if (action.onClick) {
      action.onClick(item);
    } else if (action.path) {
      router.push(action.path.replace(":id", item._id || item.id));
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Render cell value
  const renderCellValue = (item, column) => {
    const value = column.key ? item[column.key] : column.getValue?.(item);

    if (column.type === "currency") {
      return formatCurrency(value);
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === "status") {
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "active" || value === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      );
    }

    if (column.render) {
      return column.render(value, item);
    }

    return value;
  };

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <Card className="p-6">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {createButtonPath && (
          <Button
            onClick={() => router.push(createButtonPath)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createButtonText}
          </Button>
        )}
      </div>

      <Card className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          {customFilters ? (
            customFilters({ filters, onFilterChange: handleFilterChange })
          ) : (
            <div className="flex gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={filters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="min-w-[150px]"
                >
                  <option value="">{filter.placeholder}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
                      column.sortable !== false ? "cursor-pointer" : ""
                    }`}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    {column.label}
                    {column.sortable !== false && renderSortIndicator(column.key)}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr
                  key={item._id || item.id || index}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => handleRowClick(item)}
                >
                  {customRowRenderer ? (
                    customRowRenderer(item, index)
                  ) : (
                    columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {renderCellValue(item, column)}
                      </td>
                    ))
                  )}
                  
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {customActions ? (
                          customActions(item)
                        ) : (
                          actions.map((action) => (
                            <Button
                              key={action.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(action, item);
                              }}
                              variant={action.variant || "outline"}
                              size="sm"
                              className={action.className}
                            >
                              {action.label}
                            </Button>
                          ))
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {data.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No data found</div>
            <div className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BaseListComponent;
