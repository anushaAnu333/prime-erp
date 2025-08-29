import React from "react";

const Input = ({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  readOnly = false,
  className = "",
  size = "md",
  fullWidth = true,
  icon,
  iconPosition = "left",
  helperText,
  ...props
}) => {
  const baseClasses =
    "block w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 text-gray-900 placeholder-gray-500";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const states = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
    success: "border-green-300 focus:border-green-500 focus:ring-green-500",
  };

  const getState = () => {
    if (error) return "error";
    if (success) return "success";
    return "default";
  };

  const classes = [
    baseClasses,
    sizes[size],
    states[getState()],
    disabled ? "bg-gray-50 cursor-not-allowed text-gray-500" : "bg-white",
    fullWidth ? "w-full" : "",
    icon && iconPosition === "left" ? "pl-10" : "",
    icon && iconPosition === "right" ? "pr-10" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-1 text-sm text-green-600">{success}</p>}
      {helperText && !error && !success && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
