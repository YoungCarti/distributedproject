import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white px-8 py-3 flex justify-end items-center border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className="font-semibold text-slate-800">{user.name}</span>
        <button
          onClick={handleLogout}
          className="bg-transparent border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg cursor-pointer font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}
