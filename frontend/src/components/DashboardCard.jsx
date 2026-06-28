/* eslint-disable no-unused-vars */
export function DashboardCard({
  title,
  value,
  icon: Icon,
  iconColor,
  valueColor,
}) {
  return (
    <div className='bg-white shadow rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100'>
      <div className='flex items-center justify-between'>
        <h3 className='text-gray-500 text-sm font-medium'>{title}</h3>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${valueColor} mt-2`}>{value}</p>
    </div>
  );
}
