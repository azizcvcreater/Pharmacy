// src/components/common/Table.jsx
import { useTranslation } from '../../hooks/useTranslation';
import LoadingSpinner from './LoadingSpinner';

const Table = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  loading = false,
  emptyMessage = "No records found",
  className = ""
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="md" text={t('common.loading')} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-500">{emptyMessage || t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  col.align === 'right' ? 'text-right' : 
                  col.align === 'center' ? 'text-center' : 'text-left'
                }`}
                style={{ width: col.width || 'auto' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.render ? col.render(item, index) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;