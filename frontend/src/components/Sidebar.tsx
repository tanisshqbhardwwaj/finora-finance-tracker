import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">💰 Finora</h1>
        <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <NavLink to="/dashboard" className={linkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClass}>
          💳 Transactions
        </NavLink>
        <NavLink to="/budget" className={linkClass}>
          🎯 Budget
        </NavLink>
        <NavLink to="/categories" className={linkClass}>
          🏷️ Categories
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 text-sm text-gray-400 hover:text-red-400 transition-colors text-left px-4"
      >
        🚪 Logout
      </button>
    </aside>
  );
};

export default Sidebar;
