import { NavLink } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { NavItems } from './NavItems';

export function Sidebar({ sidebarOpen, navItems, user, onLogout }) {
  return (
    <aside
      className={`hidden lg:flex lg:flex-col overflow-hidden bg-white/90 backdrop-blur-sm border-r border-gray-200/60 shadow-lg transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className='flex-1 overflow-y-auto p-4 sidebar-scroll'>
        <NavItems items={navItems} collapsed={!sidebarOpen} />
      </nav>

      <div
        className={`flex-shrink-0 p-4 border-t border-gray-200/60 bg-gray-50/50 transition-all ${
          !sidebarOpen ? 'flex flex-col items-center space-y-3' : ''
        }`}
      >
        {sidebarOpen ? (
          <>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3 flex-1'>
                <div className='flex-shrink-0'>
                  <div className='h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium'>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {user?.name}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors'
            >
              <FiLogOut className='h-4 w-4' />
              Logout
            </button>
          </>
        ) : (
          <>
            <div className='h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium'>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={onLogout}
              className='p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
              title='Logout'
            >
              <FiLogOut className='h-5 w-5' />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
