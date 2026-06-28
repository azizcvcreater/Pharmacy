// src/pages/settings/AccessDenied.jsx
import { FiShield } from 'react-icons/fi';

export function AccessDenied() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl p-8 text-center max-w-md'>
        <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <FiShield className='w-10 h-10 text-red-500' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Access Denied</h2>
        <p className='text-gray-600'>
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}
