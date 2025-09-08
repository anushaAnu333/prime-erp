"use client";

import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  type = "info", // "success", "error", "warning", "info"
  showCloseButton = true,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancelButton = false,
  size = "md", // "sm", "md", "lg"
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          titleColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case "error":
        return {
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case "warning":
        return {
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "lg":
        return "max-w-2xl";
      default:
        return "max-w-lg";
    }
  };

  const typeStyles = getTypeStyles();
  const sizeClasses = getSizeClasses();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses}`}>
          <div className={`border-l-4 ${typeStyles.borderColor}`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div
                  className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${typeStyles.iconBg}`}>
                  <div className={typeStyles.iconColor}>{typeStyles.icon}</div>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  {title && (
                    <h3
                      className={`text-lg font-medium leading-6 ${typeStyles.titleColor} mb-4`}>
                      {title}
                    </h3>
                  )}
                  {children ? (
                    <div className="mt-2">{children}</div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions - Only show if no children (custom content) */}
            {!children && (
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    type === "success"
                      ? "bg-green-600 hover:bg-green-500"
                      : type === "error"
                      ? "bg-red-600 hover:bg-red-500"
                      : type === "warning"
                      ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                  onClick={handleConfirm}>
                  {confirmText}
                </button>
                {showCancelButton && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={handleCancel}>
                    {cancelText}
                  </button>
                )}
                {showCloseButton && !showCancelButton && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={handleCancel}>
                    Close
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
