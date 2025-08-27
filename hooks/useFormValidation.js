import { useState, useCallback } from "react";

export const useFormValidation = (validationRules = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field
  const validateField = useCallback((name, value, rules = {}) => {
    const fieldRules = { ...validationRules[name], ...rules };
    const fieldErrors = [];

    // Required validation
    if (fieldRules.required && !value) {
      fieldErrors.push(fieldRules.required === true ? "This field is required" : fieldRules.required);
    }

    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      fieldErrors.push(
        fieldRules.minLengthMessage || 
        `Must be at least ${fieldRules.minLength} characters`
      );
    }

    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      fieldErrors.push(
        fieldRules.maxLengthMessage || 
        `Must be no more than ${fieldRules.maxLength} characters`
      );
    }

    // Pattern validation
    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.patternMessage || "Format is invalid");
    }

    // Email validation
    if (fieldRules.email && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        fieldErrors.push("Please enter a valid email address");
      }
    }

    // Phone validation
    if (fieldRules.phone && value) {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(value.replace(/\s/g, ""))) {
        fieldErrors.push("Please enter a valid phone number");
      }
    }

    // Number validation
    if (fieldRules.number && value) {
      if (isNaN(value) || value < 0) {
        fieldErrors.push("Please enter a valid number");
      }
    }

    // Min value validation
    if (fieldRules.min !== undefined && value !== "" && parseFloat(value) < fieldRules.min) {
      fieldErrors.push(`Value must be at least ${fieldRules.min}`);
    }

    // Max value validation
    if (fieldRules.max !== undefined && value !== "" && parseFloat(value) > fieldRules.max) {
      fieldErrors.push(`Value must be no more than ${fieldRules.max}`);
    }

    // Custom validation function
    if (fieldRules.custom && typeof fieldRules.custom === "function") {
      const customError = fieldRules.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    return fieldErrors;
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const fieldErrors = validateField(fieldName, formData[fieldName]);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors[0]; // Take first error
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  // Validate a specific field
  const validateSingleField = useCallback((name, value, rules = {}) => {
    const fieldErrors = validateField(name, value, rules);
    const error = fieldErrors.length > 0 ? fieldErrors[0] : "";

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === "";
  }, [validateField]);

  // Mark field as touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((name) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  // Get error for a field
  const getFieldError = useCallback((name) => {
    return errors[name] || "";
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((name) => {
    return !!errors[name];
  }, [errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((name) => {
    return !!touched[name];
  }, [touched]);

  // Check if form has any errors
  const hasErrors = useCallback(() => {
    return Object.keys(errors).some((key) => errors[key]);
  }, [errors]);

  // Get all errors
  const getAllErrors = useCallback(() => {
    return errors;
  }, [errors]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    // State
    errors,
    touched,

    // Validation functions
    validateForm,
    validateSingleField,
    validateField,

    // Touch functions
    setFieldTouched,
    isFieldTouched,

    // Error functions
    getFieldError,
    hasFieldError,
    hasErrors,
    getAllErrors,
    clearErrors,
    clearFieldError,

    // Reset
    resetValidation,
  };
};

// Predefined validation rules
export const validationRules = {
  required: { required: true },
  email: { email: true },
  phone: { phone: true },
  number: { number: true },
  minLength: (length) => ({ minLength: length }),
  maxLength: (length) => ({ maxLength: length }),
  min: (value) => ({ min: value }),
  max: (value) => ({ max: value }),
  pattern: (pattern, message) => ({ pattern, patternMessage: message }),
  custom: (validator) => ({ custom: validator }),
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhar: /^[0-9]{12}$/,
  pincode: /^[1-9][0-9]{5}$/,
};
