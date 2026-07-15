// src/components/layout/Layout.jsx
import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiUser, 
  FiHome,
  FiPlusCircle,
  FiChevronDown,
  FiTruck,
  FiDollarSign,
  FiShoppingCart,
  FiBarChart2,
  FiCalendar,
  FiFileText,
  FiChevronRight,
  FiGlobe
} from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import API from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from '../../hooks/useTranslation';

const Layout = () => {
  const { t, i18n, isRTL } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showReportsSubmenu, setShowReportsSubmenu] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Languages configuration
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English', dir: 'ltr' },
    { code: 'ps', label: 'پښتو', flag: '🇦🇫', nativeLabel: 'Pashto', dir: 'rtl' },
    { code: 'fa-AF', label: 'دری', flag: '🇦🇫', nativeLabel: 'Dari', dir: 'rtl' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Check if reports submenu should be open
  useEffect(() => {
    if (location.pathname.startsWith('/reports')) {
      setShowReportsSubmenu(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (parsedUser.role) {
              localStorage.setItem('userRole', parsedUser.role);
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        
        const token = localStorage.getItem('token');
        if (token) {
          const response = await API.get('/me');
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('userRole', response.data.role);
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            navigate('/login');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/logout');
    } catch (error) {
      // Silent fail if network error
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Language change handler
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    const lang = languages.find(l => l.code === langCode);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = langCode;
    setShowLanguageDropdown(false);
  };

  const userRole = user?.role || localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  // Navigation items with translations
  const navItems = [
    { path: '/dashboard', icon: <FiHome />, label: t('dashboard.title') || 'Dashboard', visible: true },
    { path: '/medicines', icon: <FaPills />, label: t('medicines.title') || 'Medicines', visible: true },
    { path: '/expiry', icon: <FiCalendar />, label: t('expiry.title') || 'Expiry', visible: true },
    { path: '/suppliers', icon: <FiTruck />, label: t('suppliers.title') || 'Suppliers', visible: true },
    { path: '/purchases', icon: <FiShoppingCart />, label: t('purchases.title') || 'Purchases', visible: true },
    { path: '/sales', icon: <FiDollarSign />, label: t('sales.title') || 'Sales', visible: true },
    { path: '/expenses', icon: <FiDollarSign />, label: t('expenses.title') || 'Expenses', visible: true },
    { path: '/payments', icon: <FiDollarSign />, label: t('payments.title') || 'Payments', visible: true },
    { path: '/users', icon: <FiUser />, label: t('users.title') || 'Users', visible: isAdmin },
  ];

  // Report submenu items with translations - FIXED
  const reportItems = [
    { path: '/reports', icon: <FiBarChart2 />, label: t('reports.title') || 'Profit & Loss Report' },
    { path: '/reports/sales', icon: <FiFileText />, label: t('reports.salesReport') || 'Sales Report' },
    { path: '/reports/profit-loss', icon: <FiBarChart2 />, label: t('reports.title') || 'Profit & Loss' },
  ];

  const visibleNavItems = navItems.filter(item => item.visible);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <LoadingSpinner size="xl" text={t('common.loading')} />
      </div>
    );
  }

  const isReportActive = location.pathname.startsWith('/reports');

  return (
    <div className={`flex flex-col h-screen bg-gray-50 overflow-hidden ${isRTL() ? 'rtl' : 'ltr'}`}>
      {/* HEADER */}
      <header className="flex justify-between items-center px-3 sm:px-4 md:px-6 h-14 sm:h-16 bg-white border-b border-gray-200 shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl sm:text-2xl"
            aria-label={t('common.toggleSidebar') || 'Toggle sidebar'}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <FaPills className="text-blue-600 text-xl sm:text-2xl" />
            <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent whitespace-nowrap">
              {t('app.name') || 'PharmaCare'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* LANGUAGE SWITCHER */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              aria-label={t('common.selectLanguage') || 'Change language'}
            >
              <FiGlobe className="w-4 h-4" />
              <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
              <span className="hidden md:inline text-xs sm:text-sm">{currentLanguage.label}</span>
              <FiChevronDown 
                size={14} 
                className={`text-gray-400 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
                  {t('common.selectLanguage') || 'Select Language'}
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{lang.label}</div>
                      <div className="text-xs text-gray-400">{lang.nativeLabel}</div>
                    </div>
                    {i18n.language === lang.code && (
                      <span className="text-blue-600 text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                  <span>{t('common.keyboardShortcut') || 'Ctrl+Shift+E/P/D'}</span>
                  <span>{currentLanguage.flag} {currentLanguage.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {user?.profile_image_url ? (
                    <img 
                      src={user.profile_image_url} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:block max-w-[100px] truncate">
                  {user?.name || t('common.user') || 'User'}
                </span>
                <FiChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    showProfileDropdown ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      {user?.profile_image_url ? (
                        <img 
                          src={user.profile_image_url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 flex-items-center justify-center text-white text-xl font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.name || t('common.user') || 'User'}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || t('common.noEmail') || 'No email'}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role === 'admin' ? t('profile.role.admin') : t('profile.role.staff')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/profile');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser size={18} className="text-gray-400 flex-shrink-0" />
                    {t('profile.title')}
                  </button>
                </div>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut size={18} className="text-red-400 flex-shrink-0" />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={closeSidebar}
          ></div>
        )}

        {/* SIDEBAR */}
        <aside 
          className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 h-full z-10 flex flex-col ${
            sidebarOpen ? 'w-60' : isMobile ? 'w-0 -translate-x-full' : 'w-16'
          } ${isMobile ? 'fixed left-0 top-14 sm:top-16 shadow-xl' : 'relative'}`}
        >
          <nav className="py-4 flex-1 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-1 px-2">
              {visibleNavItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!sidebarOpen && !isMobile && 'justify-center'}`
                    }
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    {(sidebarOpen || isMobile) && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}

              {/* Reports Menu with Submenu - FIXED */}
              <li>
                <button
                  onClick={() => {
                    if (sidebarOpen || isMobile) {
                      setShowReportsSubmenu(!showReportsSubmenu);
                    } else {
                      navigate('/reports');
                    }
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                    isReportActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!sidebarOpen && !isMobile && 'justify-center'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0"><FiBarChart2 /></span>
                    {(sidebarOpen || isMobile) && (
                      <span className="text-sm font-medium truncate">{t('reports.title') || 'Reports'}</span>
                    )}
                  </div>
                  {(sidebarOpen || isMobile) && (
                    <FiChevronRight 
                      className={`transition-transform duration-200 ${
                        showReportsSubmenu ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </button>
                
                {/* Submenu Items - FIXED */}
                {(sidebarOpen || isMobile) && showReportsSubmenu && (
                  <ul className={`ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2 ${isRTL() ? 'border-r-2 border-l-0 mr-4 pr-2 ml-0' : ''}`}>
                    {reportItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`
                          }
                        >
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              
              {/* Add Staff Button (Admin Only) */}
              {(sidebarOpen || isMobile) && isAdmin && (
                <li className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeSidebar();
                      navigate('/create-staff');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors w-full whitespace-nowrap"
                  >
                    <FiPlusCircle className="text-xl flex-shrink-0" />
                    <span className="text-sm font-medium">{t('users.addStaff') || 'Add Staff'}</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200">
            {/* Logout Button */}
            <div className="p-3 flex-shrink-0">
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full ${
                  !sidebarOpen && !isMobile ? 'justify-center' : ''
                }`}
              >
                <FiLogOut className="text-xl flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="text-sm font-medium">{t('auth.logout') || 'Logout'}</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-gray-50 transition-all duration-300 ${
          isMobile ? 'w-full' : ''
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;