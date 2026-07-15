// src/components/suppliers/SupplierForm.jsx
import Input from '../common/Input';
import Button from '../common/Button';
import { FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const SupplierForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <Input
          label={t('suppliers.fields.name')}
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder={t('forms.enterName')}
          required
          icon={<FiUser className="text-gray-400" size={18} />}
        />

        <Input
          label={t('suppliers.fields.phone')}
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder={t('forms.enterPhone')}
          icon={<FiPhone className="text-gray-400" size={18} />}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('suppliers.fields.address')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <FiMapPin size={18} />
            </span>
            <textarea
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder={t('forms.enterAddress')}
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
            {isEditing ? t('common.update') : t('suppliers.add')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SupplierForm;