import React from "react";

const Select = ({
  label,
  error,
  helperText,
  options = [],
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

  const selectClasses = `
  w-full border border-slate-600 rounded-lg
  bg-slate-800 text-slate-100
  focus:outline-none focus:ring-2 focus:ring-blue-500
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
      <select className={selectClasses} {...props}>
        {props.children || (
          <>
            {props.placeholder && (
              <option value="">{props.placeholder}</option>
            )}
            {options.map((option) => (
              <option
                key={option.key || option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
