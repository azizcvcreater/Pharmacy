import { NavLink } from 'react-router-dom';
import { FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { NavItems } from './NavItems';

export function MobileSidebar({ isOpen, onClose, navItems, user, onLogout }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className='fixed inset-0 bg-black/50 z-30 lg:hidden'
        onClick={onClose}
      />
      <aside className='fixed top-0 left-0 h-full w-64 z-40 bg-white/95 backdrop-blur-sm shadow-2xl overflow-y-auto sidebar-scroll lg:hidden animate-slide-in flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <span className='font-semibold text-gray-700'>Menu</span>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <FiX className='h-5 w-5 text-gray-600' />
          </button>
        </div>

        <nav className='p-4 flex-1'>
          {user?.role === 'admin' && (
            <div className='mb-4'>
              <NavLink
                to='/tran'
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <RiExchangeDollarLine
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-indigo-500' : 'text-gray-400'
                      }`}
                    />
                    Transactions
                    {isActive && (
                      <span className='ml-auto h-2 w-2 rounded-full bg-indigo-500'></span>
                    )}
                  </>
                )}
              </NavLink>
            </div>
          )}
          <NavItems items={navItems} onClick={onClose} />
        </nav>

        <div className='p-4 border-t border-gray-200/60 bg-gray-50/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium'>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {user?.name}
                </p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <NavLink
                to='/setting'
                onClick={onClose}
                className='p-2 text-gray-500 hover:text-indigo-600 transition-colors'
              >
                <FiSettings className='h-5 w-5' />
              </NavLink>
            )}
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className='mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors'
          >
            <FiLogOut className='h-4 w-4' />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
