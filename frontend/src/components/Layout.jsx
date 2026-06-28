import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import {
  MdDashboard,
  MdLocalPharmacy,
  MdMoneyOff,
  MdLocalHospital,
} from 'react-icons/md';
import { FaBoxes, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userButtonRef = useRef(null);
  const modalRef = useRef(null);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const openUserModal = () => setUserModalOpen(true);
  const closeUserModal = () => setUserModalOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        closeUserModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userModalOpen]);

  // All navigation items – no role filtering
  const navItems = [
    { to: '/', icon: MdDashboard, label: 'Dashboard' },
    { to: '/user', icon: FiUsers, label: 'Users' },
    { to: '/doc', icon: MdLocalHospital, label: 'Doctor' },
    { to: '/medicine', icon: FaBoxes, label: 'Stock' },
    { to: '/items', icon: AiOutlinePlusCircle, label: 'Items' },
    { to: '/purchase', icon: FaShoppingCart, label: 'Purchase' },
    { to: '/sale', icon: FaShoppingBag, label: 'Sale' },
    { to: '/expense', icon: MdMoneyOff, label: 'Expense' },
    { to: '/suppliers', icon: FiUsers, label: 'Suppliers' },
    { to: '/payments', icon: RiExchangeDollarLine, label: 'Payments' },
  ];

  // Render a single navigation link
  const renderNavLink = (item, collapsed) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={closeMobileMenu}
      className={({ isActive }) =>
        `group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? item.label : ''}
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`h-5 w-5 flex-shrink-0 ${collapsed ? 'mr-0' : 'mr-3'}`}
          />
          {!collapsed && item.label}
          {!collapsed && isActive && (
            <span className='ml-auto h-2 w-2 rounded-full bg-indigo-500'></span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className='flex h-screen w-screen flex-col bg-gradient-to-br from-slate-50 to-gray-100 font-sans antialiased overflow-hidden'>
      {/* Header */}
      <header className='sticky top-0 z-20 flex h-16 items-center bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 sm:px-6 text-gray-800 shadow-sm'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex gap-25'>
            <div className='flex items-center space-x-3'>
              <button
                onClick={toggleMobileMenu}
                className='lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600'
                aria-label='Toggle menu'
              >
                <FiMenu className='h-6 w-6' />
              </button>
              {/* Desktop sidebar toggle button */}
              <button
                onClick={toggleSidebar}
                className='hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition'
                aria-label='Toggle sidebar'
              >
                {sidebarOpen ? (
                  <FiChevronLeft className='h-5 w-5' />
                ) : (
                  <FiChevronRight className='h-5 w-5' />
                )}
              </button>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md'>
                <MdLocalPharmacy className='h-6 w-6' />
              </div>
              <h1 className='text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                MediTrack
              </h1>
            </div>
            {/* Transactions link - now visible to all logged-in users */}
            <NavLink
              to='/tran'
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <RiExchangeDollarLine className='h-5 w-5' />
              <span className='hidden sm:inline'>Transactions</span>
            </NavLink>
          </div>

          <div className='flex items-center space-x-3'>
            <button
              ref={userButtonRef}
              onClick={openUserModal}
              className='flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition'
              aria-label='User menu'
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
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
        </div>
      </header>

      {/* Main container */}
      <div className='flex flex-1 overflow-hidden relative'>
        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:flex lg:flex-col overflow-hidden bg-white/90 backdrop-blur-sm border-r border-gray-200/60 shadow-lg transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Scrollable navigation area */}
          <nav className='flex-1 overflow-y-auto p-4 sidebar-scroll'>
            <ul className='space-y-1'>
              {navItems.map((item) => (
                <li key={item.to}>{renderNavLink(item, !sidebarOpen)}</li>
              ))}
            </ul>
          </nav>

          {/* User section - fixed at bottom with Logout */}
          <div
            className={`flex-shrink-0 p-4 border-t border-gray-200/60 bg-gray-50/50 transition-all ${
              !sidebarOpen ? 'flex flex-col items-center space-y-3' : ''
            }`}
          >
            {sidebarOpen ? (
              // Expanded sidebar: show full user info + logout
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
                {/* Logout button */}
                <button
                  onClick={() => {
                    logout();
                    closeUserModal();
                  }}
                  className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition'
                >
                  <FiLogOut className='h-4 w-4' />
                  Logout
                </button>
              </>
            ) : (
              // Collapsed sidebar: show only avatar + logout icon
              <>
                <div className='h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium'>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeUserModal();
                  }}
                  className='p-2 rounded-lg text-red-500 hover:bg-red-50 transition'
                  title='Logout'
                >
                  <FiLogOut className='h-5 w-5' />
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className='fixed inset-0 bg-black/50 z-30 lg:hidden'
              onClick={closeMobileMenu}
            />
            <aside className='fixed top-0 left-0 h-full w-64 z-40 bg-white/95 backdrop-blur-sm shadow-2xl overflow-y-auto sidebar-scroll lg:hidden animate-slide-in flex flex-col'>
              <div className='flex items-center justify-between p-4 border-b border-gray-100'>
                <span className='font-semibold text-gray-700'>Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className='p-1 rounded-lg hover:bg-gray-100'
                >
                  <FiX className='h-5 w-5 text-gray-600' />
                </button>
              </div>
              <nav className='p-4 flex-1'>
                {/* Transactions link for all users on mobile */}
                <div className='mb-4'>
                  <NavLink
                    to='/tran'
                    onClick={closeMobileMenu}
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
                <ul className='space-y-1'>
                  {navItems.map((item) => (
                    <li key={item.to}>{renderNavLink(item, false)}</li>
                  ))}
                </ul>
              </nav>
              {/* Mobile user section with logout only */}
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
                      <p className='text-xs text-gray-500 truncate'>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className='mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition'
                >
                  <FiLogOut className='h-4 w-4' />
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className='flex-1 overflow-hidden bg-slate-50/50 p-4 sm:p-6'>
          <div className='rounded-2xl border-gray-100/80 bg-white p-4 sm:p-6 shadow-xl shadow-gray-200/50 backdrop-blur-sm h-full flex flex-col'>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className='border-t border-gray-200/60 bg-white/80 py-3 px-4 sm:py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500 backdrop-blur-sm'>
        © {new Date().getFullYear()} MediTrack. All rights reserved.
      </footer>

      {/* User Modal */}
      {userModalOpen && user && (
        <>
          <div
            className='fixed inset-0 bg-black/50 z-50'
            onClick={closeUserModal}
          />
          <div
            ref={modalRef}
            className='fixed z-50 bg-white rounded-xl shadow-xl w-72 p-5'
            style={{ top: '4rem', right: '1rem' }}
          >
            <div className='flex flex-col items-center space-y-3'>
              <div className='h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold'>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900'>{user.name}</p>
                <p className='text-xs text-gray-500'>{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  closeUserModal();
                }}
                className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition'
              >
                <FiLogOut className='h-4 w-4' />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
