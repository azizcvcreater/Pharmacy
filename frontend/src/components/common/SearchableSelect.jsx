// src/components/common/SearchableSelect.jsx
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const SearchableSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Search and select...',
  required = false,
  error = '',
  className = '',
  disabled = false,
  renderOption = null,
  ...props
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = options.filter(option => {
      const label = option.label?.toLowerCase() || '';
      const searchFields = option.searchFields?.toLowerCase() || label;
      return searchFields.includes(term) || label.includes(term);
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({
      target: {
        name: name,
        value: option.value
      }
    });
    setIsOpen(false);
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name: name,
        value: ''
      }
    });
    setSearchTerm('');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const defaultRenderOption = (option) => {
    if (option.label) return option.label;
    return option.value;
  };

  const renderOptionFn = renderOption || defaultRenderOption;

  return (
    <div className={`mb-4 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`
            w-full px-4 py-2.5 border rounded-lg 
            focus:outline-none focus:ring-2 transition-colors
            bg-white cursor-text
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
            flex items-center justify-between
          `}
          onClick={toggleDropdown}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {selectedOption ? (
              <span className="truncate text-gray-800">
                {renderOptionFn(selectedOption)}
              </span>
            ) : (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <FiX size={16} />
              </button>
            )}
            <FiChevronDown 
              size={18} 
              className={`text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('common.search')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {t('common.noResults')}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors
                      ${value === option.value ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                      flex items-center gap-2
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800">
                        {renderOptionFn(option)}
                      </div>
                    </div>
                    {value === option.value && (
                      <span className="text-blue-600 flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {filteredOptions.length} {t('common.items')} {t('common.found')}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;