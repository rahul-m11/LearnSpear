import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, AlertCircle, Sparkles, ArrowRight, Eye, EyeOff, Shield, Zap, Award } from 'lucide-react';
import { LogoIcon } from '../../components/LogoIcon';

const Login = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const loginInFlightRef = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRoleLabelFromEmail = (email) => {
    const normalized = String(email || '').trim().toLowerCase();
    if (normalized.endsWith('@admin.in')) return 'Admin';
    if (normalized.endsWith('@ac.in')) return 'Instructor';
    if (normalized.endsWith('@gmail.com')) return 'Learner';
    return null;
  };

  const buildLoginDeniedMessage = (email) => {
    const roleLabel = getRoleLabelFromEmail(email);
    if (!roleLabel) {
      return 'Login not allowed: account not found in database for this role/domain, or invalid credentials.';
    }
    return `Login not allowed for ${roleLabel}: account not found in database for this role/domain, or invalid credentials.`;
  };

  const withTimeout = (promise, timeoutMs) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'instructor') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginInFlightRef.current) return;
    loginInFlightRef.current = true;
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const result = await withTimeout(
        login(formData.email, formData.password),
        12000
      );
      if (result?.ok) {
        // Context will update user, useEffect will redirect
      } else {
        const roleLabel = getRoleLabelFromEmail(formData.email);
        if (roleLabel && ['invalid_credentials', 'profile_missing', 'role_invalid', 'domain_mismatch'].includes(result?.code)) {
          setError(`Login not allowed for ${roleLabel}: ${result?.message || buildLoginDeniedMessage(formData.email)}`);
        } else {
          setError(result?.message || buildLoginDeniedMessage(formData.email));
        }
      }
    } catch (err) {
      if (String(err?.message || '').toLowerCase() === 'timeout') {
        setError('Login is taking too long. Please check your internet/Supabase connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
      loginInFlightRef.current = false;
    }
  };

  const quickLogin = async (email, password) => {
    if (loginInFlightRef.current) return;
    loginInFlightRef.current = true;
    setFormData({ email, password });
    setError('');
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = await withTimeout(login(email, password), 12000);
      if (!result?.ok) {
        const roleLabel = getRoleLabelFromEmail(email);
        if (roleLabel && ['invalid_credentials', 'profile_missing', 'role_invalid', 'domain_mismatch'].includes(result?.code)) {
          setError(`Login not allowed for ${roleLabel}: ${result?.message || buildLoginDeniedMessage(email)}`);
        } else {
          setError(result?.message || buildLoginDeniedMessage(email));
        }
      }
    } catch (err) {
      if (String(err?.message || '').toLowerCase() === 'timeout') {
        setError('Login is taking too long. Please check your internet/Supabase connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
      loginInFlightRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-cyan-600 to-slate-800 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl floating-element-delayed"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <LogoIcon className="h-9 w-9" />
              </div>
              <span className="text-3xl font-bold">LearnSphere</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Start your learning<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-sky-200">journey today</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-md">
              Join thousands of learners and unlock your potential with our expert-led courses.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Learn at your own pace</h3>
                <p className="text-sm text-white/70">Self-paced courses designed for busy professionals</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Earn certificates</h3>
                <p className="text-sm text-white/70">Get recognized for your achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Lifetime access</h3>
                <p className="text-sm text-white/70">Access your courses anytime, anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-500/10 to-slate-500/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <LogoIcon className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">LearnSphere</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white/50 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="LearnSphere" className="h-32 w-32 object-contain" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-500">
                Sign in to continue your learning journey
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-shake">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Quick Login Buttons */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 text-center mb-3">Quick access demo accounts</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('admin@admin.in', 'Learn@123')}
                  className="p-3 bg-gradient-to-br from-cyan-50 to-sky-100 hover:from-cyan-100 hover:to-sky-200 rounded-xl transition-all group"
                >
                  <div className="text-cyan-600 font-semibold text-sm group-hover:scale-105 transition-transform">Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('john@ac.in', 'Learn@123')}
                  className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group"
                >
                  <div className="text-blue-600 font-semibold text-sm group-hover:scale-105 transition-transform">Instructor</div>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('jane@gmail.com', 'Learn@123')}
                  className="p-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all group"
                >
                  <div className="text-green-600 font-semibold text-sm group-hover:scale-105 transition-transform">Learner</div>
                </button>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-400/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
