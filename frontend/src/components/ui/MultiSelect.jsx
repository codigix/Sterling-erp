import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  error,
  helperText,
  disabled = false,
  containerClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = Array.isArray(value) ? value : [];

  const handleSelect = (option) => {
    const isSelected = safeValue.includes(option);
    const newValue = isSelected
      ? safeValue.filter((item) => item !== option)
      : [...safeValue, option];
    onChange(newValue);
  };

  const handleRemove = (option) => {
    onChange(safeValue.filter((item) => item !== option));
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2
            focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 min-h-[40px] flex items-center text-xs justify-between cursor-pointer
            ${error ? "border-red-500 focus-within:ring-red-500" : ""}
            ${
              disabled
                ? "bg-slate-100 dark:bg-slate-900 opacity-70 cursor-not-allowed"
                : "bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
            }
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {safeValue && safeValue.length > 0 ? (
              safeValue.map((item) => (
                <div
                  key={item}
                  className={`${
                    disabled
                      ? "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                      : "bg-blue-600 dark:bg-blue-700 text-white"
                  } text-xs px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap`}
                >
                  {item}
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                      className="hover:text-red-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
            )}
          </div>
          {!disabled && (
            <ChevronDown
              size={20}
              className={`text-slate-400 dark:text-slate-500 transition-transform flex-shrink-0 ml-2 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          )}
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full mt-1 border border-slate-600 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                    safeValue.includes(option)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-medium"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={safeValue.includes(option)}
                    onChange={() => {}}
                    className="cursor-pointer"
                  />
                  {option}
                </div>
              ))}
            </div>
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

export default MultiSelect;
