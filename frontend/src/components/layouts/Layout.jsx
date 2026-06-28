import { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { UserModal } from './UserModal';
import { Footer } from './Footer';
import { navItems } from './navConfig';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userButtonRef = useRef(null);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const openUserModal = () => setUserModalOpen(true);
  const closeUserModal = () => setUserModalOpen(false);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleLogout = () => {
    logout();
    closeUserModal();
  };

  return (
    <div className='flex h-screen w-screen flex-col bg-gradient-to-br from-slate-50 to-gray-100 font-sans antialiased overflow-hidden'>
      <Header
        toggleMobileMenu={toggleMobileMenu}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        userButtonRef={userButtonRef}
        openUserModal={openUserModal}
      />

      <div className='flex flex-1 overflow-hidden relative'>
        <Sidebar
          sidebarOpen={sidebarOpen}
          navItems={filteredNavItems}
          user={user}
          onLogout={handleLogout}
        />

        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={toggleMobileMenu}
          navItems={filteredNavItems}
          user={user}
          onLogout={handleLogout}
        />

        <main className='flex-1 overflow-hidden bg-slate-50/50 p-3 sm:p-4 md:p-6'>
          <div className='rounded-2xl border-gray-100/80 bg-white p-4 sm:p-6 shadow-xl shadow-gray-200/50 backdrop-blur-sm h-full flex flex-col overflow-auto'>
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />

      <UserModal
        isOpen={userModalOpen}
        onClose={closeUserModal}
        user={user}
        onLogout={handleLogout}
        buttonRef={userButtonRef}
      />
    </div>
  );
}
