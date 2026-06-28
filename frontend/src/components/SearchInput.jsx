import { FiSearch } from 'react-icons/fi';

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className='sm:w-72'>
      <div className='relative'>
        <input
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
        />
        <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
      </div>
    </div>
  );
}
