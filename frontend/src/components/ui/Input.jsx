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
    sm: "p-2 text-xs",
    default: "p-2 text-sm",
    lg: "px-3 py-2 text-sm",
  };

  const inputClasses = `
  w-full border border-slate-200 rounded-lg bg-white text-slate-900 mb-3 text-xs placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
  transition-colors duration-200
    ${sizeClasses[size]}
    ${error ? "border-red-500 focus:ring-red-500" : ""}
    ${props.disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60" : ""}
    ${className}
  `;

  return (
    <div className={`space-y-1 mt-2 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 mb-0.5 text-left">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs pointer-events-none text-slate-400">
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
