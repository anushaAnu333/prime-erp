import { cn } from "@/lib/utils";

const Card = ({ children, className = "", padding = "p-6", ...props }) => {
  const cardClasses = cn(
    "bg-white rounded-lg shadow-sm border border-gray-200",
    padding,
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header component
Card.Header = ({ children, className = "", ...props }) => (
  <div
    className={cn("border-b border-gray-200 pb-4 mb-4", className)}
    {...props}>
    {children}
  </div>
);

// Card Title component
Card.Title = ({ children, className = "", ...props }) => (
  <h3
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}>
    {children}
  </h3>
);

// Card Content component
Card.Content = ({ children, className = "", ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

// Card Footer component
Card.Footer = ({ children, className = "", ...props }) => (
  <div
    className={cn("border-t border-gray-200 pt-4 mt-4", className)}
    {...props}>
    {children}
  </div>
);

export default Card;
