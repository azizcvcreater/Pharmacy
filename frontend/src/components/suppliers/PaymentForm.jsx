// src/components/suppliers/PaymentForm.jsx
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { FiDollarSign, FiCalendar, FiFileText, FiHash } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const PaymentForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  suppliers = [],
  isEditing = false,
  loading = false
}) => {
  const { t } = useTranslation();

  const paymentMethodOptions = [
    { value: 'cash', label: t('payments.methods.cash') },
    { value: 'bank_transfer', label: t('payments.methods.bankTransfer') },
    { value: 'check', label: t('payments.methods.check') },
    { value: 'credit_card', label: t('payments.methods.creditCard') },
    { value: 'online', label: t('payments.methods.online') },
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <Select
          label={t('payments.fields.supplier')}
          name="supplier_id"
          value={formData.supplier_id}
          onChange={onChange}
          options={suppliers.map(s => ({ value: s.id, label: s.name }))}
          placeholder={t('forms.selectSupplier')}
          required
        />

        <Input
          label={t('payments.fields.amount')}
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={onChange}
          placeholder={t('forms.enterAmount')}
          required
          icon={<FiDollarSign className="text-gray-400" size={18} />}
        />

        <Input
          label={t('payments.fields.date')}
          name="payment_date"
          type="date"
          value={formData.payment_date}
          onChange={onChange}
          required
          icon={<FiCalendar className="text-gray-400" size={18} />}
        />

        <Select
          label={t('payments.fields.method')}
          name="payment_method"
          value={formData.payment_method}
          onChange={onChange}
          options={paymentMethodOptions}
          placeholder={t('forms.selectPaymentMethod')}
          required
        />

        <Input
          label={t('payments.fields.reference')}
          name="reference_number"
          value={formData.reference_number}
          onChange={onChange}
          placeholder={t('forms.enterReference')}
          icon={<FiHash className="text-gray-400" size={18} />}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('payments.fields.notes')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FiFileText size={18} />
            </span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              placeholder={t('forms.enterNotes')}
              rows="3"
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
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
            {isEditing ? t('common.update') : t('payments.record')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;