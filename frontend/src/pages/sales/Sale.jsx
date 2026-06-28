/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react';
import { FiDownload, FiPlus } from 'react-icons/fi';
import api from '../../api';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SearchInput } from '../../components/SearchInput';
import { TablePagination } from '../../components/TablePagination';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { SaleTable } from './components/SaleTable';
import { SaleDetail } from './components/SaleDetail';
import { SaleForm } from './components/SaleForm';
import Toast from '../../components/Toast';

export default function Sale() {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
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
  const [form, setForm] = useState({
    bill_no: '',
    patient_name: '',
    sale_date: new Date().toISOString().slice(0, 10),
    paid_amount: 0,
    medicines: [
      {
        medicine_id: '',
        quantity: 1,
        medicine: null,
      },
    ],
  });

  // ---------- Validation ----------
  const validateSaleForm = (formData, availableMedicines) => {
    if (!formData.bill_no.trim()) return 'Bill number is required.';
    if (!formData.patient_name.trim()) return 'Patient name is required.';
    if (!formData.sale_date) return 'Sale date is required.';
    if (formData.paid_amount < 0) return 'Paid amount cannot be negative.';

    // Build stock map (respect original_quantity from edit mode)
    const stockMap = {};
    availableMedicines.forEach((med) => {
      stockMap[med.id] = med.quantity;
    });
    formData.medicines.forEach((row) => {
      if (row.medicine?.original_quantity != null) {
        stockMap[row.medicine_id] = row.medicine.original_quantity;
      }
    });

    const allocated = {};
    for (let i = 0; i < formData.medicines.length; i++) {
      const row = formData.medicines[i];
      if (!row.medicine_id) return `Row ${i + 1}: Please select a medicine.`;
      if (!row.quantity || row.quantity <= 0)
        return `Row ${i + 1}: Quantity must be greater than 0.`;

      const available =
        stockMap[row.medicine_id] - (allocated[row.medicine_id] || 0);
      if (parseInt(row.quantity) > available) {
        return `Row ${i + 1}: Only ${available} units available for this medicine.`;
      }
      allocated[row.medicine_id] =
        (allocated[row.medicine_id] || 0) + parseInt(row.quantity);
    }
    return null;
  };

  // Clean payload: remove medicine object and original_quantity
  const prepareSalePayload = (formData) => ({
    ...formData,
    medicines: formData.medicines.map(({ medicine_id, quantity }) => ({
      medicine_id,
      quantity,
    })),
  });

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

  useEffect(() => {
    fetchSales(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  useEffect(() => {
    api.get('/medicines').then((res) => setMedicines(res.data));
  }, []);

  const fetchSales = async (page = 1, status = 'all') => {
    setLoading(true);
    try {
      const url =
        status !== 'all'
          ? `/sales?page=${page}&status=${status}`
          : `/sales?page=${page}`;
      const res = await api.get(url);
      setSales(res.data.data || res.data);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || res.data.data?.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSaleReport = (status) => {
    window.open(
      `http://127.0.0.1:8000/api/sale/report/table?status=${status}`,
      '_blank',
    );
  };

  const addRow = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        { medicine_id: '', quantity: 1, medicine: null },
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

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'paid_amount' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectMedicine = (index, medicineId) => {
    const medicine = medicines.find((m) => m.id == medicineId);
    const rows = [...form.medicines];
    rows[index].medicine_id = medicineId;
    rows[index].medicine = medicine;
    rows[index].quantity = ''; // reset quantity when medicine changes
    setForm({ ...form, medicines: rows });
  };

  const handleQuantityChange = (index, value) => {
    const rows = [...form.medicines];
    rows[index].quantity = value;
    setForm({ ...form, medicines: rows });
  };

  const resetForm = () => {
    setForm({
      bill_no: '',
      patient_name: '',
      sale_date: new Date().toISOString().slice(0, 10),
      paid_amount: 0,
      medicines: [{ medicine_id: '', quantity: 1, medicine: null }],
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const error = validateSaleForm(form, medicines);
    if (error) {
      showToast(error, 'error');
      return;
    }
    const payload = prepareSalePayload(form);
    try {
      await api.post('/sales', payload);
      showToast('Sale saved successfully!', 'success');
      setShowCreate(false);
      resetForm();
      fetchSales(currentPage, statusFilter);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to save sale.';
      showToast(msg, 'error');
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      const data = res.data;
      setEditId(id);
      setForm({
        bill_no: data.bill_no,
        patient_name: data.patient_name,
        sale_date: data.sale_date,
        paid_amount: data.paid_amount ?? 0,
        medicines: data.details.map((d) => ({
          medicine_id: d.medicine.id,
          quantity: d.quantity,
          medicine: {
            ...d.medicine,
            original_quantity: d.medicine.quantity + d.quantity,
          },
        })),
      });
      setShowEdit(true);
    } catch (error) {
      console.error(error);
      showToast('Failed to load sale data.', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const error = validateSaleForm(form, medicines);
    if (error) {
      showToast(error, 'error');
      return;
    }
    const payload = prepareSalePayload(form);
    try {
      await api.put(`/sales/${editId}`, payload);
      showToast('Sale updated successfully!', 'success');
      setShowEdit(false);
      resetForm();
      fetchSales(currentPage, statusFilter);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update sale.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/sales/${deleteId}`);
      showToast('Sale deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchSales(currentPage, statusFilter);
    } catch (error) {
      showToast('Delete failed. Please try again.', 'error');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedSale(res.data);
      setShowDetail(true);
    } catch (error) {
      console.error(error);
      showToast('Failed to load sale details.', 'error');
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

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) return sales;
    const lowerSearch = searchTerm.toLowerCase();
    return sales.filter((sale) => {
      const searchable = [
        sale.id,
        sale.bill_no,
        sale.patient_name,
        sale.sale_date,
        sale.payment_status,
        sale.total_amount,
        sale.paid_amount,
        sale.due_amount,
      ]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return searchable.includes(lowerSearch);
    });
  }, [sales, searchTerm]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Sales</h1>
        <button
          onClick={() => setShowCreate(true)}
          className='mt-4 sm:mt-0 flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2'
        >
          <FiPlus className='mr-2 h-5 w-5' />
          Add Sale
        </button>
      </div>

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
            onClick={() => downloadSaleReport(statusFilter)}
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
            placeholder='Search sales...'
          />
        </div>
      </div>

      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
        {loading ? (
          <LoadingSpinner />
        ) : filteredSales.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>No sales found.</p>
          </div>
        ) : (
          <>
            <SaleTable
              sales={filteredSales}
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

      {/* Modals */}
      {showCreate && (
        <Modal title='Create Sale' onClose={closeModals}>
          <SaleForm
            form={form}
            medicines={medicines}
            addRow={addRow}
            removeRow={removeRow}
            onHeaderChange={handleHeaderChange}
            onSelectMedicine={handleSelectMedicine}
            onQuantityChange={handleQuantityChange}
            onSubmit={handleCreateSubmit}
            submitLabel='Save Sale'
            onCancel={closeModals}
          />
        </Modal>
      )}

      {showEdit && (
        <Modal title='Edit Sale' onClose={closeModals}>
          <SaleForm
            form={form}
            medicines={medicines}
            addRow={addRow}
            removeRow={removeRow}
            onHeaderChange={handleHeaderChange}
            onSelectMedicine={handleSelectMedicine}
            onQuantityChange={handleQuantityChange}
            onSubmit={handleEditSubmit}
            submitLabel='Update Sale'
            onCancel={closeModals}
          />
        </Modal>
      )}

      {showDetail && selectedSale && (
        <Modal
          title={`Sale Details - Bill ${selectedSale.bill_no}`}
          onClose={closeModals}
        >
          <SaleDetail sale={selectedSale} />
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

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeModals}
        onConfirm={confirmDelete}
        itemName={`sale #${deleteId}`}
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
