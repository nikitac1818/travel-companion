import React from "react";

export const Label = React.forwardRef(function Label({ className = "", ...props }, ref) {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium text-gray-700 mb-1 inline-block ${className}`}
      {...props}
    />
  );
});
