"use client";

import React, { useState, useEffect } from "react";
import Card from "./Card";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import Modal from "./Modal";
import { useModal } from "../../hooks/useModal";

const Form = ({
  title,
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  error = null,
  success = null,
  validation = {},
  className = "",
  layout = "grid", // "grid" or "stack"
  showCancel = true,
  showReset = false,
  resetText = "Reset",
  redirectPath = null,
  onSuccess = null,
  size = "md",
  children,
  ...props
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { modalState, showSuccess, showError, hideModal } = useModal();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validate field on blur
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const fieldValidation = validation[field];
    if (!fieldValidation) return null;

    const errors = [];

    if (
      fieldValidation.required &&
      (!value || value.toString().trim() === "")
    ) {
      errors.push(`${fieldValidation.label || field} is required`);
    }

    if (
      fieldValidation.minLength &&
      value &&
      value.toString().length < fieldValidation.minLength
    ) {
      errors.push(
        `${fieldValidation.label || field} must be at least ${
          fieldValidation.minLength
        } characters`
      );
    }

    if (
      fieldValidation.maxLength &&
      value &&
      value.toString().length > fieldValidation.maxLength
    ) {
      errors.push(
        `${fieldValidation.label || field} must be no more than ${
          fieldValidation.maxLength
        } characters`
      );
    }

    if (
      fieldValidation.pattern &&
      value &&
      !fieldValidation.pattern.test(value)
    ) {
      errors.push(
        fieldValidation.message ||
          `${fieldValidation.label || field} format is invalid`
      );
    }

    if (fieldValidation.custom) {
      const customError = fieldValidation.custom(value, formData);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors.length > 0 ? errors[0] : null;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    try {
      const result = await onSubmit(formData);

      if (onSuccess) {
        onSuccess(result);
      } else {
        showSuccess(success || "Form submitted successfully!");

        if (redirectPath) {
          // Handle redirect
          window.location.href = redirectPath;
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showError(error.message || "Failed to submit form");
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

  const renderField = (field) => {
    const fieldError = errors[field.name];
    const isTouched = touched[field.name];
    const showError = fieldError && isTouched;

    const commonProps = {
      value: formData[field.name] || "",
      onChange: (e) => handleInputChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
      error: showError ? fieldError : null,
      disabled: loading || field.disabled,
      required: field.required,
      placeholder: field.placeholder,
      helperText: field.helperText,
      icon: field.icon,
      iconPosition: field.iconPosition,
      size: field.size || size,
    };

    switch (field.type) {
      case "select":
        return (
          <Select
            {...commonProps}
            options={field.options || []}
            onChange={(value) => handleInputChange(field.name, value)}
            placeholder={field.placeholder || `Select ${field.label}`}
          />
        );

      case "textarea":
        return (
          <div className={field.fullWidth ? "w-full" : ""}>
            {field.label && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <textarea
              {...commonProps}
              rows={field.rows || 4}
              className={`block w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 ${
                showError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {showError && (
              <p className="mt-1 text-sm text-red-600">{fieldError}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              disabled={loading || field.disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      default:
        return <Input {...commonProps} type={field.type || "text"} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${className}`}>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            {title}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" {...props}>
            {layout === "grid" ? (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index}>{renderField(field)}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index}>{renderField(field)}</div>
                ))}
              </div>
            )}

            {children}

            <div className="flex gap-3 pt-4 justify-end">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitText}
              </Button>

              {showReset && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-4">
                  {resetText}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancelButton={modalState.showCancelButton}
        size={modalState.size}
      />
    </div>
  );
};

export default Form;
