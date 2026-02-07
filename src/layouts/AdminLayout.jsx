import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, BookOpen, BarChart3, LogOut, Home, TrendingUp, PieChart } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/courses', label: 'My Courses', icon: BookOpen },
    { path: '/admin/reporting', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 animate-slide-in-down sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4 group min-w-0">
              <LayoutDashboard className="w-6 md:w-8 h-6 md:h-8 text-primary-600 group-hover:animate-wiggle transition-transform flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">LearnSphere</h1>
                <p className="hidden sm:block text-xs md:text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 md:w-10 h-8 md:h-10 rounded-full border-2 border-primary-500 hover:scale-110 transition-transform avatar-online"
              />
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all hover:rotate-12 btn-press flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 md:w-5 h-4 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] animate-slide-in-left">
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium shadow-sm border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-soft' : 'group-hover:scale-110 transition-transform'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* Back to Courses */}
            <Link
              to="/courses"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1 group text-gray-700 hover:bg-gray-50"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Back to Courses</span>
            </Link>
          </nav>
        </aside>

        {/* Mobile Navigation - Tabs */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-300 ${
                  isActive
                    ? 'text-primary-600 border-t-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/courses"
            className="flex-1 flex flex-col items-center gap-1 py-3 px-2 text-gray-600 hover:bg-gray-50 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
