// src/components/medicines/MedicineForm.jsx
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { FiDollarSign, FiPackage } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const MedicineForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  loading = false
}) => {
  const { t } = useTranslation();

  const dosageOptions = [
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Capsule', label: 'Capsule' },
    { value: 'Syrup', label: 'Syrup' },
    { value: 'Injection', label: 'Injection' },
    { value: 'Cream', label: 'Cream' },
    { value: 'Ointment', label: 'Ointment' },
    { value: 'Drops', label: 'Drops' },
    { value: 'Inhaler', label: 'Inhaler' },
  ];

  const routeOptions = [
    { value: 'Oral', label: 'Oral' },
    { value: 'Topical', label: 'Topical' },
    { value: 'Injection', label: 'Injection' },
    { value: 'Inhalation', label: 'Inhalation' },
    { value: 'Sublingual', label: 'Sublingual' },
    { value: 'Rectal', label: 'Rectal' },
    { value: 'Ophthalmic', label: 'Ophthalmic' },
    { value: 'Otic', label: 'Otic' },
    { value: 'Nasal', label: 'Nasal' },
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('medicines.fields.generic')}
            name="generic"
            value={formData.generic}
            onChange={onChange}
            placeholder={`${t('common.enter')} Generic`}
            required
          />

          <Input
            label={t('medicines.fields.brand')}
            name="brand"
            value={formData.brand}
            onChange={onChange}
            placeholder={`${t('common.enter')} Brand`}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('medicines.fields.dosage')}
            name="dosage"
            value={formData.dosage}
            onChange={onChange}
            options={dosageOptions}
            placeholder={t('common.select')}
            required
          />

          <Input
            label={t('medicines.fields.strength')}
            name="strength"
            type="number"
            value={formData.strength}
            onChange={onChange}
            placeholder="e.g., 500"
            required
          />

          <Select
            label={t('medicines.fields.route')}
            name="route"
            value={formData.route}
            onChange={onChange}
            options={routeOptions}
            placeholder={t('common.select')}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('medicines.title')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('medicines.fields.stock')}
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={onChange}
              placeholder="0"
              icon={<FiPackage className="text-gray-400" size={18} />}
            />

            <Input
              label={t('medicines.fields.purchasePrice')}
              name="purchase_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.purchase_price}
              onChange={onChange}
              placeholder={t('forms.enterAmount')}
              icon={<FiDollarSign className="text-gray-400" size={18} />}
            />

            <Input
              label={t('medicines.fields.sellingPrice')}
              name="selling_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.selling_price}
              onChange={onChange}
              placeholder={t('forms.enterAmount')}
              icon={<FiDollarSign className="text-gray-400" size={18} />}
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
            {isEditing ? t('common.update') : t('medicines.add')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MedicineForm;