"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  loading = false,
  disabled = false,
  error = false,
  onSearch = null,
  displayKey = "label",
  valueKey = "value",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle option selection
  const handleOptionClick = (option, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Call onChange with the selected value
    if (onChange && typeof onChange === "function") {
      onChange(option[valueKey]);
    }

    // Close dropdown and clear search
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle dropdown toggle
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  // Get selected option display text
  const getSelectedText = () => {
    const selectedOption = options.find((option) => option[valueKey] === value);
    return selectedOption ? selectedOption[displayKey] : placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-left border rounded-lg shadow-sm bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}>
        <div className="flex items-center justify-between">
          <span className={`${value ? "text-gray-900" : "text-gray-500"}`}>
            {getSelectedText()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
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
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option[valueKey] || index}
                  type="button"
                  onClick={(e) => handleOptionClick(option, e)}
                  className={`
                    w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer
                    ${
                      option[valueKey] === value
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-900"
                    }
                  `}>
                  {option[displayKey]}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
