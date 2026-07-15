// src/pages/Users.jsx
import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from '../hooks/useTranslation';
import { FiEdit2, FiTrash2, FiUserPlus, FiUser, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SearchBar from "../components/common/SearchBar";
import { useToast } from "../components/common/ToastContainer";

export default function Users() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/me");
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || t('errors.generic'), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user) => {
    if (user.role === 'admin') {
      showToast(t('errors.unauthorized'), "warning");
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await API.delete(`/users/${selectedUser.id}`);
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      showToast(t('success.deleted'), "success");
    } catch (err) {
      showToast(err.response?.data?.message || t('errors.generic'), "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const confirmEdit = async () => {
    setEditLoading(true);
    try {
      const data = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      
      if (editForm.password) {
        data.password = editForm.password;
      }

      await API.put(`/users/${selectedUser.id}`, data);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm({ name: "", email: "", role: "staff", password: "" });
      showToast(t('success.updated'), "success");
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat()[0]
        : err.response?.data?.message || t('errors.generic');
      showToast(errorMsg, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      staff: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const columns = [
    {
      header: t('users.table.user'),
      key: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {item.profile_image_url ? (
              <img 
                src={item.profile_image_url} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${
                item.role === 'admin' 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-blue-500 to-cyan-600'
              }`}>
                {getInitials(item.name)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <FiMail size={12} />
              {item.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('users.table.role'),
      key: 'role',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(item.role)}`}>
          <FiShield size={12} />
          {item.role === 'admin' ? t('users.roles.admin') : t('users.roles.staff')}
        </span>
      )
    },
    {
      header: t('users.table.createdBy'),
      key: 'admin',
      render: (item) => {
        if (item.role === 'admin') {
          return <span className="text-xs text-gray-400">{t('users.self')}</span>;
        }
        const admin = users.find(u => u.id === item.admin_id);
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
              {admin?.profile_image_url ? (
                <img 
                  src={admin.profile_image_url} 
                  alt={admin.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {admin ? getInitials(admin.name) : '?'}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">{admin?.name || 'Unknown'}</span>
          </div>
        );
      }
    },
    {
      header: t('users.table.joined'),
      key: 'created_at',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <FiCalendar size={14} className="text-gray-400" />
          {new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      header: t('users.table.actions'),
      key: 'actions',
      align: 'right',
      render: (item) => {
        const isCurrentUser = currentUser?.id === item.id;
        const isAdmin = item.role === 'admin';
        
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleEdit(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={t('common.edit')}
              title={t('common.edit')}
            >
              <FiEdit2 size={16} />
            </button>
            {!isCurrentUser && !isAdmin && (
              <button
                onClick={() => handleDelete(item)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label={t('common.delete')}
                title={t('common.delete')}
              >
                <FiTrash2 size={16} />
              </button>
            )}
            {isCurrentUser && (
              <span className="text-xs text-gray-400 px-2">{t('users.you')}</span>
            )}
            {isAdmin && !isCurrentUser && (
              <span className="text-xs text-gray-400 px-2">(Admin)</span>
            )}
          </div>
        );
      },
      width: '140px'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  const totalUsers = filteredUsers.length;
  const totalAdmins = filteredUsers.filter(u => u.role === 'admin').length;
  const totalStaff = filteredUsers.filter(u => u.role === 'staff').length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {t('users.title')}
            <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {totalUsers}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('users.subtitle')}</p>
        </div>
        <Button
          onClick={() => navigate("/create-staff")}
          icon={<FiUserPlus size={18} />}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {t('users.addStaff')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('users.statistics.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiUser size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('users.statistics.administrators')}</p>
              <p className="text-2xl font-bold text-purple-600">{totalAdmins}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <FiShield size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('users.statistics.staffMembers')}</p>
              <p className="text-2xl font-bold text-blue-600">{totalStaff}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiUser size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('users.searchPlaceholder')}
              onClear={() => setSearchTerm("")}
            />
          </div>
          <div className="sm:w-48">
            <Select
              name="filterRole"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              options={[
                { value: 'all', label: t('users.roles.all') },
                { value: 'admin', label: t('users.roles.admin') },
                { value: 'staff', label: t('users.roles.staff') },
              ]}
              className="!mb-0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Table
          columns={columns}
          data={filteredUsers}
          emptyMessage={
            searchTerm 
              ? t('common.noResults')
              : t('users.noResults')
          }
        />
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDelete}
        title={t('users.delete')}
        message={
          <div>
            <p className="text-gray-600">
              {t('users.deleteConfirm', { name: selectedUser?.name || '' })}
            </p>
            <p className="text-sm text-red-500 mt-2">
              {t('users.deleteWarning')}
            </p>
          </div>
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
        loading={deleteLoading}
      />

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          setEditForm({ name: "", email: "", role: "staff", password: "" });
        }}
        title={
          <div className="flex items-center gap-2">
            <FiEdit2 className="text-blue-600" size={20} />
            <span>{t('users.edit')}</span>
            {selectedUser && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {selectedUser.name}
              </span>
            )}
          </div>
        }
        size="md"
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  {selectedUser.profile_image_url ? (
                    <img 
                      src={selectedUser.profile_image_url} 
                      alt={selectedUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${
                      selectedUser.role === 'admin' 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                      {getInitials(selectedUser.name)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}

          <Input
            label={t('users.fields.name')}
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            placeholder={t('placeholders.enterName')}
            required
            icon={<FiUser className="text-gray-400" size={18} />}
          />
          
          <Input
            label={t('users.fields.email')}
            name="email"
            type="email"
            value={editForm.email}
            onChange={handleEditChange}
            placeholder={t('placeholders.enterEmail')}
            required
            icon={<FiMail className="text-gray-400" size={18} />}
          />
          
          <Select
            label={t('users.fields.role')}
            name="role"
            value={editForm.role}
            onChange={handleEditChange}
            options={[
              { value: 'staff', label: t('users.roles.staff') },
              { value: 'admin', label: t('users.roles.admin') },
            ]}
            required
          />
          
          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-xs text-gray-500 mb-2">{t('users.fields.passwordHint')}</p>
            <Input
              label={t('users.fields.password')}
              name="password"
              type="password"
              value={editForm.password}
              onChange={handleEditChange}
              placeholder={t('placeholders.enterPassword')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                setEditForm({ name: "", email: "", role: "staff", password: "" });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={confirmEdit}
              loading={editLoading}
              icon={<FiEdit2 size={16} />}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}