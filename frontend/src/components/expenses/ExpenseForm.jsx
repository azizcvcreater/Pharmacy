// src/components/expenses/ExpenseForm.jsx
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { FiDollarSign, FiCalendar, FiFileText, FiImage, FiTag } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const ExpenseForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}) => {
  const { t } = useTranslation();

  const categoryOptions = [
    { value: 'rent', label: `🏢 ${t('expenses.categories.rent')}` },
    { value: 'utilities', label: `💡 ${t('expenses.categories.utilities')}` },
    { value: 'salary', label: `👨‍💼 ${t('expenses.categories.salary')}` },
    { value: 'inventory', label: `📦 ${t('expenses.categories.inventory')}` },
    { value: 'maintenance', label: `🔧 ${t('expenses.categories.maintenance')}` },
    { value: 'marketing', label: `📢 ${t('expenses.categories.marketing')}` },
    { value: 'transport', label: `🚚 ${t('expenses.categories.transport')}` },
    { value: 'insurance', label: `🛡️ ${t('expenses.categories.insurance')}` },
    { value: 'tax', label: `📊 ${t('expenses.categories.tax')}` },
    { value: 'other', label: `📋 ${t('expenses.categories.other')}` },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label={`${t('expenses.fields.title')} *`}
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder={t('forms.enterTitle')}
        required
        icon={<FiTag className="text-gray-400" size={18} />}
      />

      <Input
        label={`${t('expenses.fields.amount')} *`}
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        value={formData.amount}
        onChange={onChange}
        placeholder={t('forms.enterAmount')}
        required
        icon={<FiDollarSign className="text-gray-400" size={18} />}
      />

      <Input
        label={`${t('expenses.fields.date')} *`}
        name="expense_date"
        type="date"
        value={formData.expense_date}
        onChange={onChange}
        required
        icon={<FiCalendar className="text-gray-400" size={18} />}
      />

      <Select
        label={`${t('expenses.fields.category')} *`}
        name="category"
        value={formData.category}
        onChange={onChange}
        options={categoryOptions}
        placeholder={t('forms.selectCategory')}
        required
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('expenses.fields.description')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400">
            <FiFileText size={18} />
          </span>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder={t('forms.enterDescription')}
            rows="3"
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('expenses.fields.receipt')}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <FiImage size={18} />
          </span>
          <input
            type="file"
            name="receipt_image"
            accept="image/*,application/pdf"
            onChange={onChange}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {formData.receipt_image_preview && (
          <div className="mt-2">
            <img 
              src={formData.receipt_image_preview} 
              alt="Receipt" 
              className="max-h-32 rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          {isEditing ? t('common.update') : t('expenses.add')}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;