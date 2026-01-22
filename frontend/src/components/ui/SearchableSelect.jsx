import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  error,
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Update search term when value changes or component mounts
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else if (value && allowCustom) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value, selectedOption, allowCustom]);

  const filteredOptions = options.filter(option =>
    (option?.label || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        
        if (allowCustom && searchTerm && !options.find(opt => opt.label === searchTerm)) {
          onChange(searchTerm);
        } else if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else if (!value) {
           setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, value, allowCustom, searchTerm, options, onChange]);

  const handleSelect = (option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const exactMatch = filteredOptions.find(opt => opt.label.toLowerCase() === searchTerm.toLowerCase());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else if (allowCustom && searchTerm) {
        onChange(searchTerm);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative w-full border rounded-lg bg-white dark:bg-slate-700 
          transition-all duration-200 flex items-center
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 shadow-sm' : 'border-slate-300 dark:border-slate-600'}
          ${error ? 'border-red-500 ring-red-500' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-text'}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none placeholder:text-slate-400"
        />
        
        <div className="flex items-center gap-1 pr-2">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setIsOpen(!isOpen);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div 
          className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col z-[100] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="overflow-y-auto flex-1 py-1 modal-body-scroll">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value || `option-${index}`}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                    ${String(value) === String(option.value) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}
                  `}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : allowCustom && searchTerm ? (
              <div
                onClick={() => {
                  onChange(searchTerm);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 text-blue-600 dark:text-blue-400 font-medium italic border-t border-slate-100 dark:border-slate-700"
              >
                Use custom: "{searchTerm}"
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No results found for "{searchTerm}"
              </div>
            )}
            
            {allowCustom && searchTerm && filteredOptions.length > 0 && !filteredOptions.some(opt => opt.label?.toLowerCase() === searchTerm.toLowerCase()) && (
              <div
                onClick={() => {
                  onChange(searchTerm);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-sm cursor-pointer border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-blue-600 dark:text-blue-400 font-medium italic"
              >
                Use custom: "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <p className="mt-1 text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
