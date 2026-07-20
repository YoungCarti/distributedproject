import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ collapsed, onToggle }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user || user.role === 'admin') return null;

  const navItems = [
    {
      to: '/activities',
      label: 'Activities',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'My History',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      to: '/schedule',
      label: 'Announcements',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className="bg-white border-r border-slate-200 flex flex-col min-h-0 shrink-0"
      style={{
        width: collapsed ? '72px' : '256px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div className="border-b border-slate-100" style={{ padding: collapsed ? '20px 0' : '20px 24px', transition: 'padding 0.3s ease' }}>
        <Link
          to="/activities"
          className="text-blue-600 text-xl font-bold hover:text-blue-700 transition-colors no-underline flex items-center gap-2"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span
            style={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.25s ease, width 0.3s ease',
            }}
          >
            Smart Community
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1" style={{ padding: collapsed ? '16px 8px' : '16px 12px', transition: 'padding 0.3s ease' }}>
        {!collapsed && (
          <p
            className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
            style={{
              animation: 'sidebarFadeIn 0.25s ease forwards',
            }}
          >
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === '/activities' && location.pathname.startsWith('/activities'));
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 no-underline group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'padding 0.3s ease, justify-content 0.3s ease',
              }}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                }`}
                style={{ flexShrink: 0 }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : 'auto',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.25s ease, width 0.3s ease',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="px-3 pb-2" style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 border-none cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="py-4 border-t border-slate-100" style={{ padding: collapsed ? '16px 4px' : '16px 16px', transition: 'padding 0.3s ease' }}>
        <p className="text-xs text-slate-400 text-center" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {collapsed ? '© 2026' : '© 2026 Smart Community'}
        </p>
      </div>
    </aside>
  );
}
