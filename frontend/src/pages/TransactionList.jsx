import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';
import api from '../api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SearchInput } from '../components/SearchInput';
import { TablePagination } from '../components/TablePagination';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const dateInputRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch transactions',
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract YYYY-MM-DD in the user's local timezone
  const getDateKey = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format description for better readability
  const formatDescription = (type, originalDesc) => {
    if (type === 'purchase') {
      const match = originalDesc.match(/#(\d+)/);
      if (match) {
        return `Purchase Bill: ${match[1]}`;
      }
    }
    return originalDesc;
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'expense' ? `-${formatted}` : `+${formatted}`;
  };

  // Format date to local time with seconds
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Use Intl.DateTimeFormat for consistent formatting
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    // Split to get desired format: "dd MMM yyyy, hh:mm:ss am/pm"
    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day').value;
    const month = parts.find((p) => p.type === 'month').value;
    const year = parts.find((p) => p.type === 'year').value;
    const hour = parts.find((p) => p.type === 'hour').value;
    const minute = parts.find((p) => p.type === 'minute').value;
    const second = parts.find((p) => p.type === 'second').value;
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value || '';
    // Clean up hour: ensure it's 12-hour without leading zeros
    let cleanHour = hour.replace(/^0/, '');
    if (cleanHour === '0') cleanHour = '12';
    return `${day} ${month} ${year}, ${cleanHour}:${minute}:${second} ${dayPeriod}`;
  };

  // Returns a single string that represents all visible columns for search
  const getSearchableText = (tx) => {
    const typeText = tx.type;
    const descriptionText = formatDescription(tx.type, tx.description);
    const amountText = formatAmount(tx.amount, tx.type);
    const dateText = formatDate(tx.date);
    return `${typeText} ${descriptionText} ${amountText} ${dateText}`.toLowerCase();
  };

  // Filter logic
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) {
      // Show only transactions for the selected date (in local time)
      return transactions.filter((tx) => getDateKey(tx.date) === selectedDate);
    }
    const term = searchTerm.toLowerCase();
    // Search across all transactions (ignore date)
    return transactions.filter((tx) => getSearchableText(tx).includes(term));
  }, [transactions, searchTerm, selectedDate]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  // Reset page when search term or selected date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSearchTerm('');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale':
        return <FiShoppingCart className='text-green-500' />;
      case 'purchase':
        return <FiPackage className='text-blue-500' />;
      case 'expense':
        return <FiDollarSign className='text-red-500' />;
      default:
        return null;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className='rounded-lg bg-red-50 p-4 text-red-800'>
        <p>Error: {error}</p>
        <button
          onClick={fetchTransactions}
          className='mt-2 rounded-md bg-red-100 px-3 py-1 text-sm hover:bg-red-200'
        >
          Try again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='rounded-lg bg-gray-50 p-8 text-center text-gray-500'>
        No transactions found.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <h2 className='text-xl font-semibold text-gray-900'>
          Recent Transactions
        </h2>
        <div className='flex flex-wrap gap-3'>
          <div className='relative'>
            <button
              onClick={() => dateInputRef.current?.showPicker?.()}
              className='absolute left-3 top-1/2 -translate-y-1/2'
              type='button'
            >
              <FiCalendar className='h-5 w-5 text-gray-400 hover:text-gray-600' />
            </button>
            <input
              ref={dateInputRef}
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200'
            />
          </div>
          <button
            onClick={handleToday}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50'
          >
            Today
          </button>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search by any column...'
          />
        </div>
      </div>

      {!searchTerm && (
        <p className='text-sm text-gray-500'>
          Showing transactions for {new Date(selectedDate).toLocaleDateString()}
        </p>
      )}

      <div className='hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Amount
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                Date
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {paginatedTransactions.map((tx) => (
              <tr key={`${tx.type}-${tx.id}`} className='hover:bg-gray-50'>
                <td className='whitespace-nowrap px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    {getTypeIcon(tx.type)}
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getTypeColor(
                        tx.type,
                      )}`}
                    >
                      {tx.type}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatDescription(tx.type, tx.description)}
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                    tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatAmount(tx.amount, tx.type)}
                </td>
                <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                  {formatDate(tx.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='space-y-3 md:hidden'>
        {paginatedTransactions.map((tx) => (
          <div
            key={`${tx.type}-${tx.id}`}
            className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {getTypeIcon(tx.type)}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getTypeColor(
                    tx.type,
                  )}`}
                >
                  {tx.type}
                </span>
              </div>
              <span
                className={`text-sm font-medium ${
                  tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatAmount(tx.amount, tx.type)}
              </span>
            </div>
            <p className='mt-2 text-sm text-gray-900'>
              {formatDescription(tx.type, tx.description)}
            </p>
            <p className='mt-1 text-xs text-gray-500'>{formatDate(tx.date)}</p>
          </div>
        ))}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
