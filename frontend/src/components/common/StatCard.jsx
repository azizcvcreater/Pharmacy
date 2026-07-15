const StatCard = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle = '',
  className = ''
}) => {
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

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${colors[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
};

export default StatCard;