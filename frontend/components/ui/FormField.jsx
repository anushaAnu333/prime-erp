"use client";

import { useState } from "react";
import Input from "./Input";
import Select from "./Select";

const FormField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  options = [],
  validation = {},
  className = "",
  disabled = false,
  readOnly = false,
  autoComplete,
  min,
  max,
  step,
  rows = 3,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Clear local error when user starts typing
    if (localError) {
      setLocalError("");
    }

    // Validate on change if validation rules exist
    if (validation.onChange) {
      const validationError = validateField(newValue, validation);
      setLocalError(validationError);
    }

    onChange?.(e);
  };

  const handleBlur = (e) => {
    setTouched(true);
    
    // Validate on blur
    if (validation.onBlur || validation.required) {
      const validationError = validateField(e.target.value, validation);
      setLocalError(validationError);
    }

    onBlur?.(e);
  };

  const validateField = (value, rules) => {
    // Required validation
    if (rules.required && !value) {
      return rules.required === true ? `${label} is required` : rules.required;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return rules.minLengthMessage || `${label} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `${label} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || `${label} format is invalid`;
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === "function") {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return "";
  };

  const displayError = error || (touched && localError);

  // Render different input types
  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <Select
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={className}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            autoComplete={autoComplete}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              displayError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
            {...props}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            className={className}
            {...props}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={className}
            {...props}
          />
        );

      case "password":
        return (
          <Input
            type="password"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={className}
            {...props}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            className={className}
            {...props}
          />
        );

      case "tel":
        return (
          <Input
            type="tel"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={className}
            {...props}
          />
        );

      default:
        return (
          <Input
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={className}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 ${
            required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
          }`}
        >
          {label}
        </label>
      )}
      
      {renderInput()}
      
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
      
      {props.helpText && !displayError && (
        <p className="text-sm text-gray-500">{props.helpText}</p>
      )}
    </div>
  );
};

export default FormField;
