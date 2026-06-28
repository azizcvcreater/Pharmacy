import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function UserTable({ users, currentPage, perPage, onEdit, onDelete }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              ID
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Name
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
              Email
            </th>
            <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white'>
          {users.map((user, index) => (
            <tr key={user.id} className='hover:bg-gray-50'>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {(currentPage - 1) * perPage + index + 1}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                {user.name}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                {user.email}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                <button
                  onClick={() => onEdit(user)}
                  className='mr-2 rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100'
                  aria-label='Edit user'
                >
                  <FiEdit2 className='h-4 w-4' />
                </button>
                <button
                  onClick={() => onDelete(user)}
                  className='rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100'
                  aria-label='Delete user'
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
