import React, { useState, useEffect, useRef, useId, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  allowCustom = false,
  name,
  id,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const generatedId = useId();

  const inputId = id || name || generatedId;

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Sync search term when value or options change
  useEffect(() => {
    const desiredTerm = selectedOption 
      ? selectedOption.label 
      : (value && allowCustom ? String(value) : '');
    setSearchTerm(desiredTerm);
  }, [value, options, allowCustom, selectedOption]);

  const filteredOptions = options.filter(option =>
    (option?.label || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useLayoutEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.bottom;
      const dropdownHeight = 240; // max-h-60 is 240px
      
      const style = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      };

      if (availableHeight < dropdownHeight && rect.top > dropdownHeight) {
        // Show above
        style.bottom = `${window.innerHeight - rect.top + 4}px`;
      } else {
        // Show below
        style.top = `${rect.bottom + 4}px`;
      }

      setDropdownStyle(style);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) && 
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    
    const handleScroll = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedOption, value, allowCustom, searchTerm, options, onChange, isOpen]);

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
        <label htmlFor={inputId} className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-1.5 tracking-tight uppercase">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative w-full border rounded-lg bg-white dark:bg-slate-700 
          transition-all duration-200 flex items-center
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 shadow-sm' : 'border-slate-200 dark:border-slate-600'}
          ${error ? 'border-red-500 ring-red-500' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-default'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          ref={inputRef}
          type="text"
          id={inputId}
          name={name || inputId}
          aria-label={ariaLabel}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen(true);
          }}
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

      {isOpen && !disabled && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="overflow-y-auto flex-1 py-1 modal-body-scroll">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value || `option-${index}`}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
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
        </div>,
        document.body
      )}
      
      {error && <p className="mt-1 text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default React.memo(SearchableSelect);
