import React from "react";

const variantClasses = {
  default: "bg-sky-600 text-white hover:bg-sky-700",
  outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(function Button(
  { className = "", variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        variantClasses[variant] || variantClasses.default
      } ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    />
  );
});
