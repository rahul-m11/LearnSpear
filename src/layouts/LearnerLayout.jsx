import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogoIcon } from '../components/LogoIcon';
import { 
  BookOpen, 
  LogOut, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Sparkles,
  Bell,
  Search,
  ChevronDown,
  Crown,
  Zap,
  Settings,
  User,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  GraduationCap,
  Heart,
  Star,
  Github,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';

const LearnerLayout = () => {
  const { user, logout, enrollments, courses } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userEnrollments = user ? enrollments.filter(e => e.userId === user.id) : [];
  const inProgressCount = userEnrollments.filter(e => e.status === 'in-progress').length;

  // Mock notifications
  const notifications = [
    { id: 1, text: 'New course "AI Fundamentals" is now available!', time: '2h ago', unread: true },
    { id: 2, text: 'Congratulations! You earned the "Quick Learner" badge!', time: '5h ago', unread: true },
    { id: 3, text: 'Your course progress has been saved', time: '1d ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/40 to-fuchsia-50/30 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-400/15 to-fuchsia-400/15 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-3xl floating-element-delayed"></div>
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-3xl floating-element"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <div className="transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <LogoIcon className="h-12 sm:h-10 w-auto" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">LearnSphere</span>
                <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium tracking-widest uppercase leading-tight">
                  Elevate Your Skills
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/courses"
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  location.pathname === '/courses' || location.pathname === '/'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="relative z-10">Explore</span>
                <div className={`absolute inset-0 bg-blue-100/50 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 ${
                  location.pathname === '/courses' || location.pathname === '/' ? 'scale-100' : ''
                }`}></div>
              </Link>

              {user && (
                <>
                  <Link
                    to="/profile"
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                      location.pathname === '/profile'
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="relative z-10">My Learning</span>
                    {inProgressCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 text-xs rounded-full flex items-center justify-center font-bold notification-badge">
                        {inProgressCount}
                      </span>
                    )}
                    <div className={`absolute inset-0 bg-blue-100/50 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 ${
                      location.pathname === '/profile' ? 'scale-100' : ''
                    }`}></div>
                  </Link>

                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <Link
                      to="/admin/dashboard"
                      className="relative px-4 py-2 rounded-xl font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </span>
                      <div className="absolute inset-0 bg-purple-100/50 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button className="hidden md:flex p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-300">
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-300"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl py-3 animate-scale-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className={`px-4 py-3 hover:bg-gray-50/50 cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                <div>
                                  <p className="text-sm text-gray-700">{notif.text}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <button className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700">
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Points Badge */}
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border border-amber-200/50">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-700">{user.points || 0}</span>
                    <span className="text-xs text-amber-600">XP</span>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 pr-4 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl py-2 animate-scale-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50/80 transition-colors">
                            <User className="w-4 h-4" />
                            <span>View Profile</span>
                          </Link>
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50/80 transition-colors">
                            <GraduationCap className="w-4 h-4" />
                            <span>My Courses</span>
                          </Link>
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50/80 transition-colors">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50/80 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100/80 transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-5 py-2.5 text-slate-950 font-medium bg-gradient-to-r from-cyan-400 to-sky-500 rounded-xl hover:shadow-lg hover:shadow-cyan-400/25 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 glass-card border-t border-gray-200/50 animate-slide-in-down">
            <div className="px-4 py-6 space-y-3">
              <Link to="/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100/80 transition-colors">
                <Home className="w-5 h-5" />
                <span>Explore Courses</span>
              </Link>
              {user && (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100/80 transition-colors">
                    <GraduationCap className="w-5 h-5" />
                    <span>My Learning</span>
                  </Link>
                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100/80 transition-colors">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 relative z-10 animate-fade-in">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="relative mt-24 bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LearnSphere</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering learners worldwide with cutting-edge courses and personalized learning experiences. 
                Start your journey to excellence today.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Browse Courses</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Become an Instructor</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              &copy; 2026 LearnSphere. Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Odoo Hackathon.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Click Outside Handler */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setShowUserMenu(false); setShowNotifications(false); }}
        ></div>
      )}
    </div>
  );
};

export default LearnerLayout;
