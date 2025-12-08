import React from "react";

const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  containerClassName = "",
  size = "default",
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const inputClasses = `
  w-full border border-slate-600 rounded-lg
   text-slate-100
  
    ${sizeClasses[size]}
    ${error ? "border-red-500 focus:ring-red-500" : ""}
    ${className}
  `;

  return (
    <div className={`space-y-2 mt-3 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 text-left">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`${inputClasses} ${leftIcon ? "pl-10" : ""} ${
            rightIcon ? "pr-10" : ""
          }`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
