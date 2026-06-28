import { NavLink } from 'react-router-dom';

export function NavItems({ items, collapsed = false, onClick }) {
  const renderNavLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
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

  return <ul className='space-y-1'>{items.map(renderNavLink)}</ul>;
}
