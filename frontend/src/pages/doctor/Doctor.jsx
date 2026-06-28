/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../../api';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { DoctorTable } from './components/DoctorTable';
import { DoctorForm } from './components/DoctorForm';
import Toast from '../../components/Toast';

export default function Doctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Pagination
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Form state
  const [formData, setFormData] = useState({
    fees: '',
    description: '',
  });
  const [extraFees, setExtraFees] = useState([]);

  // Lock body scroll
  useEffect(() => {
    if (showCreate || showEdit || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreate, showEdit, showDeleteConfirm]);

  // Load data when page changes
  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage]);

  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/doctors?page=${page}`);
      setDoctors(res.data.data || res.data);
      setTotalPages(res.data.last_page || 1);
    } catch (error) {
      console.error(error);
      showToast('Failed to load doctors.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ fees: '', description: '' });
    setExtraFees([]);
  };

  const handleCreateClick = () => {
    resetForm();
    setCreateErrors({});
    setShowCreate(true);
  };

  const handleEditClick = async (id) => {
    try {
      const res = await api.get(`/doctors/${id}`);
      const data = res.data;
      setEditId(id);
      setFormData({
        fees: data.fees,
        description: data.description || '',
      });
      const extra = [];
      if (data.sonography_fee && data.sonography_fee > 0)
        extra.push({ type: 'sonography', amount: data.sonography_fee });
      if (data.ecg_fee && data.ecg_fee > 0)
        extra.push({ type: 'ecg', amount: data.ecg_fee });
      if (data.xray_fee && data.xray_fee > 0)
        extra.push({ type: 'xray', amount: data.xray_fee });
      setExtraFees(extra);
      setEditErrors({});
      setShowEdit(true);
    } catch (error) {
      console.error(error);
      showToast('Failed to load doctor data.', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fees: formData.fees,
        description: formData.description,
        sonography_fee: 0,
        ecg_fee: 0,
        xray_fee: 0,
      };
      extraFees.forEach((fee) => {
        if (fee.type === 'sonography') payload.sonography_fee = fee.amount || 0;
        if (fee.type === 'ecg') payload.ecg_fee = fee.amount || 0;
        if (fee.type === 'xray') payload.xray_fee = fee.amount || 0;
      });
      await api.post('/doctors', payload);
      showToast('Doctor fees added successfully!', 'success');
      setShowCreate(false);
      setCreateErrors({});
      fetchDoctors(currentPage);
    } catch (error) {
      if (error.response?.status === 422) {
        setCreateErrors(error.response.data.errors);
      } else {
        const msg = error.response?.data?.message || 'Error saving doctor fees';
        showToast(msg, 'error');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fees: formData.fees,
        description: formData.description,
        sonography_fee: 0,
        ecg_fee: 0,
        xray_fee: 0,
      };
      extraFees.forEach((fee) => {
        if (fee.type === 'sonography') payload.sonography_fee = fee.amount || 0;
        if (fee.type === 'ecg') payload.ecg_fee = fee.amount || 0;
        if (fee.type === 'xray') payload.xray_fee = fee.amount || 0;
      });
      await api.put(`/doctors/${editId}`, payload);
      showToast('Doctor fees updated successfully!', 'success');
      setShowEdit(false);
      setEditErrors({});
      fetchDoctors(currentPage);
    } catch (error) {
      if (error.response?.status === 422) {
        setEditErrors(error.response.data.errors);
      } else {
        const msg =
          error.response?.data?.message || 'Error updating doctor fees';
        showToast(msg, 'error');
      }
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteId}`);
      showToast('Doctor fees deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchDoctors(currentPage);
    } catch (error) {
      showToast('Delete failed. Please try again.', 'error');
    }
  };

  const closeModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDeleteConfirm(false);
    setDeleteId(null);
    setCreateErrors({});
    setEditErrors({});
    resetForm();
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const filteredDoctors = useMemo(() => {
    if (!searchTerm.trim()) return doctors;
    const lowerSearch = searchTerm.toLowerCase();
    return doctors.filter((doc) => {
      const searchable = [
        doc.id,
        doc.fees,
        doc.sonography_fee,
        doc.ecg_fee,
        doc.xray_fee,
        doc.description,
      ]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(lowerSearch);
    });
  }, [doctors, searchTerm]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Doctor fees</h1>
        <button
          onClick={handleCreateClick}
          className='mt-4 sm:mt-0 flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          Add Doctor Fees
        </button>
      </div>

      <div className='flex justify-end'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search by fees or description...'
        />
      </div>

      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : filteredDoctors.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No doctors found.</p>
          </div>
        ) : (
          <>
            <DoctorTable
              doctors={filteredDoctors}
              currentPage={currentPage}
              perPage={perPage}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
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

      {showCreate && (
        <Modal title='Add Doctor Fees' onClose={closeModals} size='max-w-3xl'>
          <DoctorForm
            formData={formData}
            setFormData={setFormData}
            extraFees={extraFees}
            setExtraFees={setExtraFees}
            onSubmit={handleCreateSubmit}
            submitLabel='Save Doctor Fees'
            onCancel={closeModals}
            errors={createErrors}
            clearErrors={() => setCreateErrors({})}
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title='Edit Doctor Fees' onClose={closeModals} size='max-w-3xl'>
          <DoctorForm
            formData={formData}
            setFormData={setFormData}
            extraFees={extraFees}
            setExtraFees={setExtraFees}
            onSubmit={handleEditSubmit}
            submitLabel='Update Doctor Fees'
            onCancel={closeModals}
            errors={editErrors}
            clearErrors={() => setEditErrors({})}
          />
        </Modal>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeModals}
        onConfirm={confirmDelete}
        itemName={`doctor fees #${deleteId}`}
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
