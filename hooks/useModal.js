import { useState, useCallback } from "react";

export const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel",
    showCancelButton: false,
    size: "md",
  });

  const showModal = useCallback((config) => {
    setModalState({
      isOpen: true,
      title: config.title || "",
      message: config.message || "",
      type: config.type || "info",
      onConfirm: config.onConfirm || null,
      confirmText: config.confirmText || "OK",
      cancelText: config.cancelText || "Cancel",
      showCancelButton: config.showCancelButton || false,
      size: config.size || "md",
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((message, title = "Success", onConfirm = null) => {
    showModal({
      title,
      message,
      type: "success",
      onConfirm,
      confirmText: "OK",
      showCancelButton: false,
    });
  }, [showModal]);

  const showError = useCallback((message, title = "Error", onConfirm = null) => {
    showModal({
      title,
      message,
      type: "error",
      onConfirm,
      confirmText: "OK",
      showCancelButton: false,
    });
  }, [showModal]);

  const showWarning = useCallback((message, title = "Warning", onConfirm = null, onCancel = null) => {
    showModal({
      title,
      message,
      type: "warning",
      onConfirm,
      onCancel,
      confirmText: "Continue",
      cancelText: "Cancel",
      showCancelButton: true,
    });
  }, [showModal]);

  const showInfo = useCallback((message, title = "Information", onConfirm = null) => {
    showModal({
      title,
      message,
      type: "info",
      onConfirm,
      confirmText: "OK",
      showCancelButton: false,
    });
  }, [showModal]);

  const showConfirm = useCallback((message, title = "Confirm", onConfirm, onCancel = null) => {
    showModal({
      title,
      message,
      type: "warning",
      onConfirm,
      onCancel,
      confirmText: "Yes",
      cancelText: "No",
      showCancelButton: true,
    });
  }, [showModal]);

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};
