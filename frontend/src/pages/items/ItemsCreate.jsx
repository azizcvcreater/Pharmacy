/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../../api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { ItemsTable } from './components/ItemsTable';
import { TablePagination } from '../../components/TablePagination';
import { ItemForm } from './components/ItemForm';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import Toast from '../../components/Toast';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Forms
  const [createForm, setCreateForm] = useState({
    generic: '',
    brand: '',
    dosage: '',
    strength: '',
    route: '',
  });
  const [editForm, setEditForm] = useState({
    id: null,
    generic: '',
    brand: '',
    dosage: '',
    strength: '',
    route: '',
  });

  // Load items
  const loadItems = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/items?page=${page}`);
      const data = res.data.data || res.data;
      setItems(data);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || data.length);
    } catch (error) {
      console.error(error);
      showToast('Failed to load items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(currentPage);
  }, [currentPage]);

  // Search filter
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter((item) => {
      const searchable = [
        item.id,
        item.generic,
        item.brand,
        item.dosage,
        item.strength,
        item.route,
      ]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(lowerSearch);
    });
  }, [items, searchTerm]);

  // Create handlers
  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    // Clear validation errors when user types
    setCreateErrors({});
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/items', createForm);
      showToast('Item created successfully!', 'success');
      setCreateForm({
        generic: '',
        brand: '',
        dosage: '',
        strength: '',
        route: '',
      });
      setIsCreateModalOpen(false);
      setCreateErrors({});
      loadItems(currentPage);
    } catch (error) {
      if (error.response?.status === 422) {
        setCreateErrors(error.response.data.errors);
      } else {
        const msg = error.response?.data?.message || 'Failed to create item.';
        showToast(msg, 'error');
      }
    }
  };

  // Edit handlers
  const handleEditClick = (item) => {
    setEditForm({
      id: item.id,
      generic: item.generic,
      brand: item.brand,
      dosage: item.dosage,
      strength: item.strength,
      route: item.route,
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/items/${editForm.id}`, editForm);
      showToast('Item updated successfully!', 'success');
      setEditForm({
        id: null,
        generic: '',
        brand: '',
        dosage: '',
        strength: '',
        route: '',
      });
      setIsEditModalOpen(false);
      setEditErrors({});
      loadItems(currentPage);
    } catch (error) {
      if (error.response?.status === 422) {
        setEditErrors(error.response.data.errors);
      } else {
        const msg = error.response?.data?.message || 'Failed to update item.';
        showToast(msg, 'error');
      }
    }
  };

  // Delete handlers
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/items/${itemToDelete.id}`);
      showToast('Item deleted successfully!', 'success');
      closeDeleteModal();
      if (items.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadItems(currentPage);
      }
    } catch (error) {
      showToast('Failed to delete item.', 'error');
    }
  };

  // Pagination handlers
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
        <h1 className='text-2xl font-semibold text-gray-800'>Medicines</h1>
        <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
          <span className='rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700'>
            {totalItems} total
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
          >
            <FiPlus className='mr-2 h-5 w-5' />
            New Item
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder='Search items...'
      />

      {/* Table Card */}
      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No items found.</p>
          </div>
        ) : (
          <>
            <ItemsTable
              items={filteredItems}
              currentPage={currentPage}
              perPage={perPage}
              onEdit={handleEditClick}
              onDelete={openDeleteModal}
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

      {/* Create Modal */}
      <ItemForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateErrors({});
        }}
        onSubmit={handleCreateSubmit}
        formData={createForm}
        onChange={handleCreateChange}
        title='Add New Medicine'
        submitLabel='Add Item'
        errors={createErrors}
        clearErrors={() => setCreateErrors({})}
      />

      {/* Edit Modal */}
      <ItemForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditErrors({});
        }}
        onSubmit={handleEditSubmit}
        formData={editForm}
        onChange={handleEditChange}
        title='Edit Medicine'
        submitLabel='Update Item'
        errors={editErrors}
        clearErrors={() => setEditErrors({})}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name}
      />

      {/* Toast Notifications */}
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
