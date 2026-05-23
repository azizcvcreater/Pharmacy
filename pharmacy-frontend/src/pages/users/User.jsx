/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../../api';
import { UserTable } from '../users/components/UserTable';
import { UserForm } from '../users/components/UserForm';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { Modal } from '../../components/Modal';
import { TablePagination } from '../../components/TablePagination';
import { SearchInput } from '../../components/SearchInput';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const staffOnly = users.filter((user) => user.role === 'staff');
    if (!searchTerm.trim()) return staffOnly;
    const term = searchTerm.toLowerCase();
    return staffOnly.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, currentPage, perPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / perPage));
  }, [filteredUsers, perPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateSubmit = async (formData) => {
    try {
      await api.post('/users', { ...formData, role: 'staff' });
      showToast('Staff user created successfully!', 'success');
      setShowCreate(false);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create user';
      showToast(msg, 'error');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEdit(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: 'staff',
      };
      if (formData.password.trim()) payload.password = formData.password;
      await api.put(`/users/${selectedUser.id}`, payload);
      showToast('Staff user updated successfully!', 'success');
      setShowEdit(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update user';
      showToast(msg, 'error');
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      showToast('Staff user deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  const closeModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
    setDeleteTarget(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className='space-y-6 p-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Staff Users</h1>
        <button
          onClick={() => setShowCreate(true)}
          className='mt-4 sm:mt-0 flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          Add Staff
        </button>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='sm:w-72'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search by name or email...'
          />
        </div>
      </div>

      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {filteredUsers.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No staff found.</p>
          </div>
        ) : (
          <>
            <UserTable
              users={paginatedUsers}
              currentPage={currentPage}
              perPage={perPage}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </div>

      {showCreate && (
        <Modal title='Create Staff' onClose={closeModals}>
          <UserForm
            user={null}
            onSubmit={handleCreateSubmit}
            onCancel={closeModals}
            submitLabel='Create Staff'
            isEdit={false}
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title='Edit Staff' onClose={closeModals}>
          <UserForm
            user={selectedUser}
            onSubmit={handleEditSubmit}
            onCancel={closeModals}
            submitLabel='Update Staff'
            isEdit={true}
          />
        </Modal>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeModals}
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
