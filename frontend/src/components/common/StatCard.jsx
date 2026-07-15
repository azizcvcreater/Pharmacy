// src/components/common/StatCard.jsx
import { useTranslation } from '../../hooks/useTranslation';

const StatCard = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle = '',
  className = ''
}) => {
  const { t } = useTranslation();

  const colors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
    red: 'border-l-red-500',
    pink: 'border-l-pink-500',
    indigo: 'border-l-indigo-500',
    yellow: 'border-l-yellow-500',
    teal: 'border-l-teal-500',
    cyan: 'border-l-cyan-500',
  };

  // Check if subtitle is a translation key or needs translation
  const getSubtitle = () => {
    if (!subtitle) return '';
    // If subtitle is a translation key or known hardcoded text
    const knownKeys = {
      'Amount owed to suppliers': 'dashboard.totalCreditSubtitle',
      'Amount owed by suppliers': 'dashboard.totalDebitSubtitle',
    };
    if (knownKeys[subtitle]) {
      return t(knownKeys[subtitle]);
    }
    // If subtitle contains a colon, it might be a translation key
    if (subtitle.includes(':')) {
      return t(subtitle);
    }
    return subtitle;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${colors[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title || t('common.noData')}</p>
          <p className="text-2xl font-bold text-gray-800">{value || 0}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{getSubtitle()}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
};

export default StatCard;