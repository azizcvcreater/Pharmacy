import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function DoctorTable({
  doctors,
  currentPage,
  perPage,
  onEdit,
  onDelete,
}) {
  return (
    <div className='overflow-x-auto modern-scrollbar'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Consultation Fee
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Sonography Fee
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ECG Fee
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              X‑ray Fee
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Description
            </th>
            <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {doctors.map((doctor, index) => (
            <tr key={doctor.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-800'>
                {Number(doctor.fees).toFixed(2)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {doctor.sonography_fee
                  ? `${Number(doctor.sonography_fee).toFixed(2)}`
                  : '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {doctor.ecg_fee ? `${Number(doctor.ecg_fee).toFixed(2)}` : '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {doctor.xray_fee
                  ? `${Number(doctor.xray_fee).toFixed(2)}`
                  : '—'}
              </td>
              <td className='max-w-xs truncate px-4 py-3 text-sm text-gray-500'>
                {doctor.description || '—'}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                <button
                  onClick={() => onEdit(doctor.id)}
                  className='mr-2 rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100'
                  aria-label='Edit doctor fees'
                >
                  <FiEdit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDelete(doctor.id)}
                  className='rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
                  aria-label='Delete doctor fees'
                >
                  <FiTrash2 className='h-4 w-4' />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
