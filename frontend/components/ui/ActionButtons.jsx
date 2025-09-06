"use client";

import Link from "next/link";
import { useState } from "react";

// Icon Components
const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ActionButton = ({ 
  icon, 
  onClick, 
  href, 
  variant = "default", 
  size = "sm", 
  disabled = false,
  title,
  className = "",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    view: "text-blue-600 hover:text-blue-900 hover:bg-blue-50 focus:ring-blue-500",
    edit: "text-amber-600 hover:text-amber-900 hover:bg-amber-50 focus:ring-amber-500",
    delete: "text-red-600 hover:text-red-900 hover:bg-red-50 focus:ring-red-500",
  };
  
  const sizes = {
    sm: "h-8 w-8 p-1.5",
    md: "h-10 w-10 p-2",
    lg: "h-12 w-12 p-2.5",
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={classes} title={title} {...props}>
        {icon}
      </Link>
    );
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
      {...props}
    >
      {icon}
    </button>
  );
};

const ActionButtons = ({ 
  viewHref, 
  editHref, 
  onDelete, 
  deleteConfirmMessage = "Are you sure you want to delete this item?",
  showView = true,
  showEdit = true,
  showDelete = true,
  size = "sm",
  className = "",
  viewTitle = "View",
  editTitle = "Edit",
  deleteTitle = "Delete"
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (window.confirm(deleteConfirmMessage)) {
      setIsDeleting(true);
      try {
        await onDelete();
      } catch (error) {
        console.error("Delete error:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showView && viewHref && (
        <ActionButton
          icon={<EyeIcon />}
          href={viewHref}
          variant="view"
          size={size}
          title={viewTitle}
        />
      )}
      {showEdit && editHref && (
        <ActionButton
          icon={<EditIcon />}
          href={editHref}
          variant="edit"
          size={size}
          title={editTitle}
        />
      )}
      {showDelete && onDelete && (
        <ActionButton
          icon={<DeleteIcon />}
          onClick={handleDelete}
          variant="delete"
          size={size}
          disabled={isDeleting}
          title={deleteTitle}
        />
      )}
    </div>
  );
};

export default ActionButtons;
export { ActionButton, EyeIcon, EditIcon, DeleteIcon };
