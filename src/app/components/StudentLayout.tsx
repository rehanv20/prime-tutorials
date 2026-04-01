import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';
<img src="/logo.png" />

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: BookOpen, label: 'Study Notes', path: '/student/notes' },
  { icon: FileText, label: 'Test Results', path: '/student/results' },
  { icon: BarChart3, label: 'My Analytics', path: '/student/analytics' },
];

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-green-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/src/assets/logo.png"
              alt="Prime Tutorials Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl">Prime Tutorials</h1>
              <p className="text-xs text-green-300">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-green-800 border-l-4 border-white'
                    : 'hover:bg-green-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-green-800">
          <div className="mb-4">
            <p className="text-sm text-green-300">Logged in as</p>
            <p className="text-white truncate">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-green-200 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}