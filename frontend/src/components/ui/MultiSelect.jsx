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

  const handleSelect = (option) => {
    const isSelected = value.includes(option);
    const newValue = isSelected
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  const handleRemove = (option) => {
    onChange(value.filter((item) => item !== option));
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 text-left">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            w-full border border-slate-600 rounded-lg px-3 py-2
            bg-slate-800 text-slate-100
            focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 min-h-[40px] flex items-center justify-between cursor-pointer
            ${error ? "border-red-500 focus-within:ring-red-500" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-500"}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length > 0 ? (
              value.map((item) => (
                <div
                  key={item}
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  {item}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                    className="hover:text-red-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 border border-slate-600 rounded-lg bg-slate-800 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 hover:bg-slate-700 transition-colors ${
                    value.includes(option) ? "bg-slate-700 text-blue-400" : "text-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
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
