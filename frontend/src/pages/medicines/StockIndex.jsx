import { useEffect, useState, useMemo } from 'react';
import api from '../../api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { StockTable } from './components/StockTable';

export default function StockList() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state (server‑side)
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage]);

  const fetchMedicines = (page = 1) => {
    setLoading(true);
    api
      .get(`/medicine?page=${page}`)
      .then((res) => {
        setMedicines(res.data.data || res.data);
        setTotalPages(res.data.last_page || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Filter medicines based on search term (client‑side, on current page)
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return medicines;

    const lowerSearch = searchTerm.toLowerCase();
    return medicines.filter((med) => {
      const searchable = [
        med.id,
        med.generic,
        med.brand,
        med.dosage,
        med.strength,
        med.route,
        med.buy_price,
        med.sale_price,
        med.quantity,
        med.expiry_date,
      ]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(lowerSearch);
    });
  }, [medicines, searchTerm]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Stocks</h1>
        <div className='mt-4 sm:mt-0'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search medicines...'
          />
        </div>
      </div>

      {/* Table Card */}
      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : filteredMedicines.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No medicines found.</p>
          </div>
        ) : (
          <>
            <StockTable
              medicines={filteredMedicines}
              currentPage={currentPage}
              perPage={perPage}
            />
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </div>
  );
}
