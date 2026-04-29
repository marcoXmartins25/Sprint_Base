import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Avatar from './Avatar';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.verify().then((data) => {
      api.getUsers().then((users) => {
        const full = users.find((u) => u.id === data.user.id) || data.user;
        setUser(full);
      });
    }).catch(() => {});
  }, []);

  const handleLogout = () => { api.logout(); navigate('/login'); };

  const navLink = (to, label) => (
    <Link to={to}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
        location.pathname === to
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}>
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left */}
            <div className="flex items-center gap-2">
              <Link to="/app" className="text-base font-bold text-gray-900 tracking-tight mr-4">
                Sprint<span className="text-indigo-600">Base</span>
              </Link>
              {navLink('/app', 'Dashboard')}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <Link to="/app/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                <Avatar user={user} size="w-7 h-7" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || user?.email?.split('@')[0] || ''}
                </span>
              </Link>
              <div className="w-px h-4 bg-gray-200" />
              <button onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-700 transition font-medium px-2 py-1 rounded-lg hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
