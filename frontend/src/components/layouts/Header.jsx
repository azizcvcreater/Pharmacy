import { FiMenu, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { MdLocalPharmacy } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

export function Header({
  toggleMobileMenu,
  sidebarOpen,
  toggleSidebar,
  user,
  userButtonRef,
  openUserModal,
}) {
  return (
    <header className='sticky top-0 z-20 flex h-16 items-center bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 sm:px-6 text-gray-800 shadow-sm'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-2 sm:gap-4 md:gap-6'>
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <button
              onClick={toggleMobileMenu}
              className='lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors'
              aria-label='Toggle menu'
            >
              <FiMenu className='h-5 w-5 sm:h-6 sm:w-6' />
            </button>

            <button
              onClick={toggleSidebar}
              className='hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors'
              aria-label='Toggle sidebar'
            >
              {sidebarOpen ? (
                <FiChevronLeft className='h-5 w-5' />
              ) : (
                <FiChevronRight className='h-5 w-5' />
              )}
            </button>

            <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md'>
              <MdLocalPharmacy className='h-5 w-5 sm:h-6 sm:w-6' />
            </div>

            <h1 className='text-lg sm:text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              MediTrack
            </h1>
          </div>

          {user?.role === 'admin' && (
            <NavLink
              to='/tran'
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <RiExchangeDollarLine className='h-4 w-4 sm:h-5 sm:w-5' />
              <span className='hidden sm:inline'>Transactions</span>
            </NavLink>
          )}
        </div>

        <button
          ref={userButtonRef}
          onClick={openUserModal}
          className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          aria-label='User menu'
        >
          <div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 sm:h-5 sm:w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
        </button>
      </div>
    </header>
  );
}
