// src/components/purchases/PurchaseForm.jsx
import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import SearchableSelect from '../common/SearchableSelect';
import Button from '../common/Button';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiPlus, 
  FiX, 
  FiPackage,
  FiShoppingCart,
  FiPercent,
  FiFileText,
  FiTruck,
  FiInfo
} from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api';

const PurchaseForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  suppliers = [],
  medicines = [],
  isEditing = false,
  loading = false
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState(formData.items || []);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [supplierBalance, setSupplierBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(formData.supplier_id || '');

  useEffect(() => {
    if (selectedSupplierId) {
      fetchSupplierBalance(selectedSupplierId);
    } else {
      setSupplierBalance(null);
    }
  }, [selectedSupplierId]);

  const fetchSupplierBalance = async (supplierId) => {
    try {
      setLoadingBalance(true);
      const response = await api.get(`/supplier-payments/summary/${supplierId}`);
      setSupplierBalance(response.data);
    } catch (error) {
      console.error('Error fetching supplier balance:', error);
      setSupplierBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    setSubtotal(newSubtotal);
    
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const newTotal = newSubtotal - discount + tax;
    setTotal(newTotal);
  }, [items, formData.discount, formData.tax]);

  const addItem = () => {
    if (!selectedMedicine) {
      alert(t('common.pleaseSelect'));
      return;
    }
    if (quantity <= 0) {
      alert(t('common.quantityError') || 'Quantity must be greater than 0');
      return;
    }
    if (unitPrice <= 0) {
      alert(t('common.priceError') || 'Unit price must be greater than 0');
      return;
    }

    const medicine = medicines.find(m => m.id === parseInt(selectedMedicine));
    
    const existingIndex = items.findIndex(item => item.medicine_id === parseInt(selectedMedicine));
    
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += parseInt(quantity);
      updatedItems[existingIndex].unit_price = parseFloat(unitPrice);
      updatedItems[existingIndex].total = updatedItems[existingIndex].quantity * updatedItems[existingIndex].unit_price;
      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        {
          medicine_id: parseInt(selectedMedicine),
          medicine_name: medicine?.generic || 'Unknown',
          medicine_brand: medicine?.brand || '',
          medicine_dosage: medicine?.dosage || '',
          medicine_strength: medicine?.strength || '',
          medicine_route: medicine?.route || '',
          quantity: parseInt(quantity),
          unit_price: parseFloat(unitPrice),
          total: parseInt(quantity) * parseFloat(unitPrice)
        }
      ]);
    }

    setSelectedMedicine('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const getMedicineDisplay = (medicine) => {
    return `${medicine.generic} | ${medicine.brand} | ${medicine.dosage} | ${medicine.strength}mg | ${medicine.route}`;
  };

  const renderMedicineOption = (option) => {
    const medicine = medicines.find(m => m.id === option.value);
    if (!medicine) return option.label;
    
    return (
      <div className="flex flex-col py-0.5">
        <span className="font-medium text-gray-800">{medicine.generic}</span>
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span className="text-xs text-gray-500">{medicine.brand}</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{medicine.dosage}</span>
          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{medicine.strength}mg</span>
          <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{medicine.route}</span>
        </div>
      </div>
    );
  };

  const medicineOptions = medicines.map(m => ({
    value: m.id,
    label: getMedicineDisplay(m),
    searchFields: `${m.generic} ${m.brand} ${m.dosage} ${m.strength} ${m.route}`.toLowerCase(),
    ...m
  }));

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
    onChange(e);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      supplier_id: formData.supplier_id,
      purchase_date: formData.purchase_date,
      due_date: formData.due_date || null,
      items: items.map(item => ({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      discount: parseFloat(formData.discount) || 0,
      tax: parseFloat(formData.tax) || 0,
      notes: formData.notes || ''
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <FiShoppingCart className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? t('purchases.edit') : t('purchases.new')}
          </h3>
          <p className="text-sm text-gray-500">
            {isEditing ? t('common.update') : t('common.create')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Select
            label={t('purchases.fields.supplier')}
            name="supplier_id"
            value={selectedSupplierId}
            onChange={handleSupplierChange}
            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
            placeholder={t('forms.selectSupplier')}
            required
            icon={<FiTruck className="text-gray-400" size={18} />}
          />
          
          {selectedSupplierId && (
            <div className="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiInfo className="text-gray-400" size={14} />
                  <span className="text-xs font-medium text-gray-500">{t('common.balance')}</span>
                </div>
                {loadingBalance ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-xs text-gray-400">{t('common.loading')}</span>
                  </div>
                ) : supplierBalance ? (
                  <span className={`text-sm font-bold ${supplierBalance.status_color}`}>
                    {supplierBalance.balance_formatted}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">{t('common.noData')}</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <Input
            label={t('purchases.fields.date')}
            name="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={onChange}
            required
            icon={<FiCalendar className="text-gray-400" size={18} />}
          />
        </div>
        <div>
          <Input
            label={t('purchases.fields.dueDate')}
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={onChange}
            icon={<FiCalendar className="text-gray-400" size={18} />}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600" size={18} />
            </div>
            <h4 className="font-semibold text-gray-700">{t('purchases.fields.items')}</h4>
          </div>
          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            {items.length} {t('common.items')}
          </span>
        </div>
        
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-12 md:col-span-5">
            <SearchableSelect
              name="medicine_select"
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              options={medicineOptions}
              placeholder={t('forms.searchMedicines')}
              className="!mb-0"
              renderOption={renderMedicineOption}
            />
          </div>
          
          <div className="col-span-4 md:col-span-2">
            <Input
              label={t('common.quantity')}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
              className="!mb-0"
            />
          </div>
          
          <div className="col-span-5 md:col-span-3">
            <Input
              label={t('common.unitPrice')}
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder={t('forms.enterAmount')}
              className="!mb-0"
              icon={<FiDollarSign className="text-gray-400" size={16} />}
            />
          </div>
          
          <div className="col-span-3 md:col-span-2">
            <Button
              type="button"
              onClick={addItem}
              icon={<FiPlus size={18} />}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all py-2.5"
            >
              {t('common.add')}
            </Button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('medicines.table.medicine')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('medicines.table.details')}</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.quantity')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.unitPrice')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.total')}</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.medicine_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-100">
                          {item.medicine_brand}
                        </span>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium border border-green-100">
                          {item.medicine_dosage}
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-medium border border-purple-100">
                          {item.medicine_strength}mg
                        </span>
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md text-xs font-medium border border-orange-100">
                          {item.medicine_route}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">${item.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <FiX size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-t border-gray-200">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right font-medium text-gray-700">{t('sales.fields.subtotal')}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">${subtotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            label={t('sales.fields.discount')}
            name="discount"
            type="number"
            step="0.01"
            min="0"
            value={formData.discount}
            onChange={onChange}
            placeholder={t('forms.enterAmount')}
            icon={<FiPercent className="text-gray-400" size={18} />}
          />
        </div>
        <div>
          <Input
            label={t('sales.fields.tax')}
            name="tax"
            type="number"
            step="0.01"
            min="0"
            value={formData.tax}
            onChange={onChange}
            placeholder={t('forms.enterAmount')}
            icon={<FiPercent className="text-gray-400" size={18} />}
          />
        </div>
        <div className="md:col-span-2">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('common.total')}</p>
              <p className="text-white text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FiDollarSign className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
          <FiFileText className="text-gray-400" size={16} />
          {t('common.notes')}
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder={t('forms.enterNotes')}
          rows="2"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 py-3 text-base"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1 py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          disabled={items.length === 0}
          icon={<FiShoppingCart size={18} />}
        >
          {isEditing ? t('common.update') : t('purchases.new')}
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
          <FiPackage className="mx-auto text-gray-300 text-4xl mb-2" />
          <p className="text-gray-400 text-sm">{t('forms.noItemsAdded')}</p>
          <p className="text-gray-300 text-xs">{t('forms.addItems')}</p>
        </div>
      )}
    </form>
  );
};

export default PurchaseForm;