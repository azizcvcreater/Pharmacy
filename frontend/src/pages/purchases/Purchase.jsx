/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { FiDownload, FiPlus } from 'react-icons/fi';
import api from '../../api';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { PurchaseTable } from './components/PurchaseTable';
import { PurchaseDetail } from './components/PurchaseDetail';
import { PurchaseForm } from './components/PurchaseForm';
import Toast from '../../components/Toast'; // Import Toast

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  // Pagination
  const [perPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Supplier data
  const [suppliers, setSuppliers] = useState([]);
  const [supplierBalance, setSupplierBalance] = useState(null);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Form state (shared for create & edit)
  const [form, setForm] = useState({
    supplier_id: '',
    bill_no: '',
    purchase_date: new Date().toISOString().slice(0, 10),
    paid_amount: 0,
    medicines: [
      {
        generic: '',
        brand: '',
        dosage: '',
        strength: '',
        route: '',
        quantity: 1,
        buy_price: '',
        sale_price: '',
        expiry_date: '',
      },
    ],
  });

  // Dropdown data
  const [generic, setGeneric] = useState([]);
  const [brand, setBrand] = useState([]);
  const [dosage, setDosage] = useState([]);
  const [strength, setStrength] = useState([]);
  const [route, setRoute] = useState([]);

  // ---------- Validation ----------
  const validatePurchaseForm = (formData) => {
    if (!formData.supplier_id) return 'Please select a supplier.';
    if (!formData.bill_no.trim()) return 'Bill number is required.';
    if (!formData.purchase_date) return 'Purchase date is required.';
    if (formData.paid_amount < 0) return 'Paid amount cannot be negative.';

    for (let i = 0; i < formData.medicines.length; i++) {
      const med = formData.medicines[i];
      if (!med.quantity || med.quantity <= 0)
        return `Row ${i + 1}: Quantity must be greater than 0.`;
      if (!med.generic) return `Row ${i + 1}: Generic name is required.`;
      if (!med.brand) return `Row ${i + 1}: Brand is required.`;
      if (!med.dosage) return `Row ${i + 1}: Dosage form is required.`;
      if (!med.strength) return `Row ${i + 1}: Strength is required.`;
      if (!med.route) return `Row ${i + 1}: Route is required.`;
      if (!med.buy_price || med.buy_price <= 0)
        return `Row ${i + 1}: Buy price must be greater than 0.`;
      if (!med.sale_price || med.sale_price <= 0)
        return `Row ${i + 1}: Sale price must be greater than 0.`;
      if (!med.expiry_date) return `Row ${i + 1}: Expiry date is required.`;
    }
    return null;
  };

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSupplierBalance = async (id) => {
    try {
      const res = await api.get(`/suppliers/${id}/balance`);
      setSupplierBalance(res.data.balance);
    } catch (error) {
      console.error(error);
    }
  };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showCreate || showEdit || showDetail || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreate, showEdit, showDetail, showDeleteConfirm]);

  // Load data when page or filter changes
  useEffect(() => {
    fetchPurchases(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  // Load dropdown data once
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchPurchases = async (page = 1, status = 'all') => {
    setLoading(true);
    try {
      const url =
        status !== 'all'
          ? `/purchases?page=${page}&status=${status}`
          : `/purchases?page=${page}`;
      const res = await api.get(url);
      setPurchases(res.data.data || res.data);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || res.data.data?.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const res = await api.get('/formData');
      setGeneric(res.data.generic);
      setBrand(res.data.brand);
      setDosage(res.data.dosage);
      setStrength(res.data.strength);
      setRoute(res.data.route);
    } catch (error) {
      console.error(error);
    }
  };

  // Form handlers
  const addRow = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        {
          generic: '',
          brand: '',
          dosage: '',
          strength: '',
          route: '',
          quantity: 1,
          buy_price: '',
          sale_price: '',
          expiry_date: '',
        },
      ],
    });
  };

  const removeRow = (index) => {
    if (form.medicines.length === 1) {
      showToast('At least one medicine row is required.', 'error');
      return;
    }
    const rows = [...form.medicines];
    rows.splice(index, 1);
    setForm({ ...form, medicines: rows });
  };

  const changeMedicine = (index, field, value) => {
    const rows = [...form.medicines];
    rows[index][field] = value;
    setForm({ ...form, medicines: rows });
  };

  const resetForm = () => {
    setForm({
      supplier_id: '',
      bill_no: '',
      purchase_date: new Date().toISOString().slice(0, 10),
      paid_amount: 0,
      medicines: [
        {
          quantity: 1,
          generic: '',
          brand: '',
          dosage: '',
          strength: '',
          route: '',
          buy_price: '',
          sale_price: '',
          expiry_date: '',
        },
      ],
    });
    setSupplierBalance(null);
  };

  // Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const error = validatePurchaseForm(form);
    if (error) {
      showToast(error, 'error');
      return;
    }
    try {
      await api.post('/purchases', form);
      showToast('Purchase saved successfully!', 'success');
      setShowCreate(false);
      resetForm();
      fetchPurchases(currentPage, statusFilter);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save purchase.';
      showToast(msg, 'error');
    }
  };

  // Edit
  const handleEditClick = async (id) => {
    try {
      const res = await api.get(`/purchases/${id}`);
      const data = res.data;
      setEditId(id);
      setForm({
        supplier_id: data.supplier_id || '',
        bill_no: data.bill_no,
        purchase_date: data.purchase_date,
        paid_amount: data.paid_amount ?? 0,
        medicines: data.details.map((d) => ({
          quantity: d.quantity,
          generic: d.generic,
          brand: d.brand,
          dosage: d.dosage,
          strength: d.strength,
          route: d.route,
          buy_price: d.buy_price,
          sale_price: d.sale_price,
          expiry_date: d.expiry_date,
        })),
      });
      if (data.supplier_id) {
        fetchSupplierBalance(data.supplier_id);
      }
      setShowEdit(true);
    } catch (error) {
      console.error(error);
      showToast('Failed to load purchase data.', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const error = validatePurchaseForm(form);
    if (error) {
      showToast(error, 'error');
      return;
    }
    try {
      await api.put(`/purchases/${editId}`, form);
      showToast('Purchase updated successfully!', 'success');
      setShowEdit(false);
      resetForm();
      fetchPurchases(currentPage, statusFilter);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update purchase.';
      showToast(msg, 'error');
    }
  };

  // Delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/purchases/${deleteId}`);
      showToast('Purchase deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchPurchases(currentPage, statusFilter);
    } catch (error) {
      showToast('Delete failed. Please try again.', 'error');
    }
  };

  // Detail
  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/purchases/${id}`);
      setPurchase(res.data);
      setShowDetail(true);
    } catch (error) {
      console.error(error);
      showToast('Failed to load purchase details.', 'error');
    }
  };

  const closeModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDetail(false);
    setShowDeleteConfirm(false);
    setDeleteId(null);
    resetForm();
  };

  // Status filter handler
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const downloadReport = (status) => {
    window.open(
      `http://127.0.0.1:8000/api/purchase/report/table?status=${status}`,
      '_blank',
    );
  };

  // Search filter (local)
  const filteredPurchases = useMemo(() => {
    if (!searchTerm.trim()) return purchases;
    const lowerSearch = searchTerm.toLowerCase();
    return purchases.filter((p) => {
      const searchable = [
        p.id,
        p.bill_no,
        p.purchase_date,
        p.payment_status,
        p.total_amount,
        p.paid_amount,
        p.due_amount,
      ]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(lowerSearch);
    });
  }, [purchases, searchTerm]);

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
        <h1 className='text-2xl font-semibold text-gray-800'>Purchases</h1>
        <button
          onClick={() => setShowCreate(true)}
          className='mt-4 sm:mt-0 flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          New Purchase
        </button>
      </div>

      {/* Filter and Search */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex space-x-2 rounded-lg bg-gray-100 p-1'>
          {['all', 'pending', 'paid', 'partial'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${
                statusFilter === status
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => downloadReport(statusFilter)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            <FiDownload className='w-4 h-4' />
            Download PDF {statusFilter === 'all' ? 'All' : statusFilter}
          </button>
        </div>
        <div className='sm:w-72'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search purchases...'
          />
        </div>
      </div>

      {/* Table Card */}
      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : filteredPurchases.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No purchases found.</p>
          </div>
        ) : (
          <>
            <PurchaseTable
              purchases={filteredPurchases}
              currentPage={currentPage}
              perPage={perPage}
              onView={handleViewDetails}
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

      {/* Create Modal */}
      {showCreate && (
        <Modal title='Create Purchase' onClose={closeModals} size='max-w-6xl'>
          <PurchaseForm
            form={form}
            setForm={setForm}
            generic={generic}
            brand={brand}
            dosage={dosage}
            strength={strength}
            route={route}
            addRow={addRow}
            removeRow={removeRow}
            changeMedicine={changeMedicine}
            onSubmit={handleCreateSubmit}
            submitLabel='Save Purchase'
            onCancel={closeModals}
            suppliers={suppliers}
            supplierBalance={supplierBalance}
            fetchSupplierBalance={fetchSupplierBalance}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title='Edit Purchase' onClose={closeModals} size='max-w-6xl'>
          <PurchaseForm
            form={form}
            setForm={setForm}
            generic={generic}
            brand={brand}
            dosage={dosage}
            strength={strength}
            route={route}
            addRow={addRow}
            removeRow={removeRow}
            changeMedicine={changeMedicine}
            onSubmit={handleEditSubmit}
            submitLabel='Update Purchase'
            onCancel={closeModals}
            suppliers={suppliers}
            supplierBalance={supplierBalance}
            fetchSupplierBalance={fetchSupplierBalance}
          />
        </Modal>
      )}

      {/* Detail Modal */}
      {showDetail && purchase && (
        <Modal
          title={`Purchase Details - Bill ${purchase.bill_no}`}
          onClose={closeModals}
          size='max-w-7xl'
        >
          <PurchaseDetail purchase={purchase} />
          <div className='mt-6 flex justify-end'>
            <button
              onClick={closeModals}
              className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50'
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeModals}
        onConfirm={confirmDelete}
        itemName={`purchase #${deleteId}`}
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
