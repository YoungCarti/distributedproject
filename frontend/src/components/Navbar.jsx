import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <h2 
        className="text-blue-600 m-0 text-2xl font-bold cursor-pointer hover:text-blue-700 transition-colors" 
        onClick={() => navigate(user.role === 'admin' ? '/admin' : '/activities')}
      >
        Smart Community
      </h2>
      <div className="flex gap-6 items-center">
        {user.role === 'user' && (
          <>
            <Link to="/activities" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">Activities</Link>
            <Link to="/history" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">My History</Link>
            <Link to="/schedule" className="text-slate-700 font-medium hover:text-blue-600 transition-colors">Announcements</Link>
          </>
        )}
        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
          <span className="font-semibold text-slate-800">{user.name}</span>
          <button 
            onClick={handleLogout} 
            className="bg-transparent border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg cursor-pointer font-medium hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
