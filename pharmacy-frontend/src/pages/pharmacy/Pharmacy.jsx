import { useEffect, useState, useMemo } from 'react';
import api from '../../api';
import { PharmacyTable } from './components/PharmacyTable';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { SearchInput } from '../../components/SearchInput';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { TablePagination } from '../../components/TablePagination';
import Toast from '../../components/Toast';

export default function Pharmacy() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(2);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchPharmacies = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacies', {
        params: { page, per_page: perPage },
      });
      setPharmacies(res.data.data);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      showToast('Failed to load pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies(currentPage);
  }, [currentPage]);

  const filteredPharmacies = useMemo(() => {
    if (!searchTerm.trim()) return pharmacies;
    const term = searchTerm.toLowerCase();
    return pharmacies.filter(
      (pharmacy) =>
        pharmacy.name.toLowerCase().includes(term) ||
        (pharmacy.owner_name &&
          pharmacy.owner_name.toLowerCase().includes(term)),
    );
  }, [pharmacies, searchTerm]);

  const handleToggleStatus = async (pharmacy) => {
    const newStatus = pharmacy.status === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'active' ? 'unblock' : 'block';
    if (
      window.confirm(`Are you sure you want to ${action} "${pharmacy.name}"?`)
    ) {
      try {
        await api.put(`/pharmacies/${pharmacy.id}`, { status: newStatus });
        showToast(`Pharmacy ${action}ed successfully!`, 'success');
        fetchPharmacies(currentPage);
      } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update pharmacy status', 'error');
      }
    }
  };

  const handleDeleteClick = (pharmacy) => {
    setDeleteTarget(pharmacy);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/pharmacies/${deleteTarget.id}`);
      showToast('Pharmacy deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      if (pharmacies.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchPharmacies(currentPage);
      }
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      showToast('Failed to delete pharmacy', 'error');
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='space-y-6 p-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Pharmacies</h1>
      </div>

      <div className='sm:w-72'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search by name or owner...'
        />
      </div>

      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {filteredPharmacies.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No pharmacies found.</p>
          </div>
        ) : (
          <>
            <PharmacyTable
              pharmacies={filteredPharmacies}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteClick}
            />
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.name}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: '', type: 'success' })
          }
        />
      )}
    </div>
  );
}
