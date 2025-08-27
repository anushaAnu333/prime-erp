import { cn } from "@/lib/utils";

const Input = ({ 
  type = "text", 
  className = "", 
  error = false, 
  ...props 
}) => {
  const inputClasses = cn(
    "w-full px-3 py-2.5 border rounded-lg shadow-sm bg-white text-gray-900",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    "placeholder:text-gray-400",
    {
      "border-red-300 focus:ring-red-500 focus:border-red-500": error,
      "border-gray-300": !error
    },
    className
  );

  return (
    <input
      type={type}
      className={inputClasses}
      {...props}
    />
  );
};

export default Input;
