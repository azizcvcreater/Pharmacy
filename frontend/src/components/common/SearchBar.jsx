import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear = null
}) => {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-2.5 text-gray-400">
        <FiSearch size={20} />
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;