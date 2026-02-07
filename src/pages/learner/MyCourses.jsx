import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp, BADGE_LEVELS } from '../../context/AppContext';
import {
  Search,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  DollarSign,
  Lock,
  Sparkles,
  TrendingUp,
  Star,
  Users,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Flame,
  Zap,
  Crown,
  Target,
  ArrowRight,
  GraduationCap,
  Trophy,
  Heart,
  Bookmark,
  BarChart2,
  Mic,
  X,
  History,
  Tag,
  Loader2,
  Command,
  Sprout,
  Gem,
  AlertCircle,
  XCircle,
} from 'lucide-react';

// Badge icon mapping
const BADGE_ICONS = {
  Sprout: Sprout,
  Search: Search,
  Star: Star,
  Gem: Gem,
  Trophy: Trophy,
  Crown: Crown,
};

// Helper component to render badge icons
const BadgeIcon = ({ iconName, className = "w-6 h-6" }) => {
  const IconComponent = BADGE_ICONS[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

const MyCourses = () => {
  const { user, courses, enrollCourse, getEnrollment, getUserBadge } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [courseStatusFilter, setCourseStatusFilter] = useState('all'); // New state for course status filtering
  
  // Advanced search states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isListening, setIsListening] = useState(false);
  const searchInputRef = useRef(null);
  const enrolledCoursesRef = useRef(null);

  // Popular search tags
  const popularTags = ['React', 'Python', 'JavaScript', 'Machine Learning', 'Web Development', 'Data Science'];

  // Get search suggestions based on query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = [];
    
    // Course title matches
    courses.forEach(course => {
      if (course.title.toLowerCase().includes(query) && suggestions.length < 5) {
        suggestions.push({ type: 'course', text: course.title, id: course.id });
      }
    });
    
    // Tag matches
    const allTags = [...new Set(courses.flatMap(c => c.tags || []))];
    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(query) && suggestions.length < 8) {
        suggestions.push({ type: 'tag', text: tag });
      }
    });
    
    return suggestions;
  };

  const searchSuggestions = getSearchSuggestions();

  // Save search to history
  const saveToHistory = (query) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      setIsSearchFocused(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'course') {
      navigate(`/learner/course/${suggestion.id}`);
    } else if (suggestion.type === 'tag') {
      setSelectedCategory(suggestion.text);
      setSearchQuery('');
    } else {
      setSearchQuery(suggestion);
      saveToHistory(suggestion);
    }
    setIsSearchFocused(false);
  };

  // Voice search (Web Speech API)
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to enrolled courses section when view=enrolled parameter is present
  useEffect(() => {
    if (searchParams.get('view') === 'enrolled' && enrolledCoursesRef.current) {
      setTimeout(() => {
        enrolledCoursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchParams]);

  // Categories from courses
  const categories = ['all', ...new Set(courses.flatMap(c => c.tags || []))];

  // Helper function to determine course enrollment status
  const getEnrollmentStatus = (course) => {
    if (!user) return 'not-enrolled';
    const enrollment = getEnrollment(user.id, course.id);
    if (!enrollment) return 'not-enrolled';
    return enrollment.status;
  };

  // Filter published courses based on visibility
  const availableCourses = courses.filter((course) => {
    if (!course.published) return false;
    if (course.visibility === 'signed-in' && !user) return false;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.tags?.includes(selectedCategory);
    
    // Apply course status filter
    if (user && courseStatusFilter !== 'all') {
      const enrollmentStatus = getEnrollmentStatus(course);
      if (courseStatusFilter === 'ongoing' && enrollmentStatus !== 'in-progress') return false;
      if (courseStatusFilter === 'finished' && enrollmentStatus !== 'completed') return false;
      if (courseStatusFilter === 'timedout' && enrollmentStatus !== 'timed-out') return false;
      if (courseStatusFilter === 'discontinued' && enrollmentStatus !== 'discontinued') return false;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Count courses by status
  const getStatusCounts = () => {
    if (!user) return { all: 0, ongoing: 0, finished: 0, timedout: 0, discontinued: 0 };
    const enrolledCourses = courses.filter(c => c.published && getEnrollment(user.id, c.id));
    const counts = {
      all: enrolledCourses.length,
      ongoing: 0,
      finished: 0,
      timedout: 0,
      discontinued: 0
    };
    
    enrolledCourses.forEach(course => {
      const enrollment = getEnrollment(user.id, course.id);
      if (enrollment.status === 'in-progress') counts.ongoing++;
      else if (enrollment.status === 'completed') counts.finished++;
      else if (enrollment.status === 'timed-out') counts.timedout++;
      else if (enrollment.status === 'discontinued') counts.discontinued++;
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();

  const handleCourseAction = (course) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const enrollment = getEnrollment(user.id, course.id);

    if (course.access === 'payment' && !enrollment) {
      if (window.confirm(`This course costs $${course.price}. Purchase now?`)) {
        enrollCourse(user.id, course.id);
        navigate(`/courses/${course.id}`);
      }
      return;
    }

    if (course.access === 'invitation' && !enrollment) {
      alert('This course is by invitation only. Please contact the instructor.');
      return;
    }

    if (!enrollment) {
      enrollCourse(user.id, course.id);
    }

    navigate(`/courses/${course.id}`);
  };

  const getButtonText = (course) => {
    const enrollment = user ? getEnrollment(user.id, course.id) : null;

    if (course.access === 'payment' && !enrollment) {
      return `Enroll - $${course.price}`;
    }

    if (!user) {
      if (course.access === 'invitation') return 'Invitation Only';
      return 'Start Free';
    }

    if (!enrollment) return 'Start Learning';

    if (enrollment.status === 'completed') return 'Review Course';
    if (enrollment.status === 'in-progress') return 'Continue';
    return 'Start Learning';
  };

  const currentBadge = user ? getUserBadge(user.points || 0) : null;
  const nextBadge = user
    ? BADGE_LEVELS.find((b) => b.points > (user.points || 0))
    : null;

  // Featured courses (top 3)
  const featuredCourses = availableCourses.slice(0, 3);

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-600 to-slate-800 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 animate-fade-in-down">
                <Sparkles className="w-4 h-4" />
                <span>Start your learning journey today</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
                {user ? (
                  <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-sky-200">{user.name.split(' ')[0]}</span>!</>
                ) : (
                  <>Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-sky-200">Potential</span></>
                )}
              </h1>
              <p className="text-xl text-white/80 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {user 
                  ? 'Continue your learning journey and achieve your goals.'
                  : 'Join thousands of learners and master new skills with our expert-led courses.'}
              </p>
              
              {/* Advanced Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
                  isSearchFocused 
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-40 scale-105' 
                    : 'bg-white opacity-20'
                }`}></div>
                
                <div className="relative">
                  {/* Main Search Input */}
                  <div className={`relative flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-300 ${
                    isSearchFocused ? 'ring-4 ring-white/40 shadow-cyan-500/20' : ''
                  }`}>
                    <Search className={`absolute left-5 w-5 h-5 transition-colors duration-300 ${
                      isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search courses, topics, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      className="w-full pl-14 pr-32 py-4 bg-transparent border-0 focus:ring-0 placeholder-gray-400 text-gray-800 font-medium"
                    />
                    
                    {/* Right side actions */}
                    <div className="absolute right-3 flex items-center gap-2">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      
                      {/* Voice Search */}
                      <button
                        type="button"
                        onClick={startVoiceSearch}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'hover:bg-gray-100 text-gray-400 hover:text-blue-500'
                        }`}
                      >
                        {isListening ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* Keyboard Shortcut Hint */}
                      <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                        <Command className="w-3 h-3" />
                        <span>K</span>
                      </div>
                    </div>
                  </div>

                  {/* Search Dropdown */}
                  {isSearchFocused && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                      {/* Search Suggestions */}
                      {searchSuggestions.length > 0 && (
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Suggestions</p>
                          {searchSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
                            >
                              {suggestion.type === 'course' ? (
                                <BookOpen className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Tag className="w-4 h-4 text-purple-500" />
                              )}
                              <span className="text-gray-700 group-hover:text-gray-900 font-medium">{suggestion.text}</span>
                              <span className="ml-auto text-xs text-gray-400 capitalize">{suggestion.type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Recent Searches */}
                      {searchHistory.length > 0 && !searchQuery && (
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Searches</p>
                          {searchHistory.map((query, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSuggestionClick(query)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all"
                            >
                              <History className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{query}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Popular Tags */}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Popular Topics</p>
                        <div className="flex flex-wrap gap-2 px-2">
                          {popularTags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSearchQuery(tag);
                                saveToHistory(tag);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 text-sm font-medium rounded-full border border-blue-100 hover:border-blue-200 transition-all hover:scale-105"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-gray-600 font-mono">Enter</kbd> to search</span>
                          <span className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-gray-600 font-mono">Esc</kbd> to close</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center">
                  <p className="text-3xl font-bold">{courses.length}+</p>
                  <p className="text-white/70 text-sm">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-white/70 text-sm">Learners</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">4.9</p>
                  <p className="text-white/70 text-sm">Rating</p>
                </div>
              </div>
            </div>

            {/* Right Side - Featured Card */}
            {!user && featuredCourses[0] && (
              <div className="hidden lg:block animate-fade-in-right" style={{ animationDelay: '0.5s' }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-xl"></div>
                  <div className="relative glass-card rounded-3xl p-6 transform hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">Featured Course</span>
                    </div>
                    <img 
                      src={featuredCourses[0].image} 
                      alt={featuredCourses[0].title}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{featuredCourses[0].title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{featuredCourses[0].description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{featuredCourses[0].lessons.length} lessons</span>
                      </div>
                      <button 
                        onClick={() => navigate('/register')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)"/>
          </svg>
        </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`grid grid-cols-1 ${user ? 'lg:grid-cols-4' : ''} gap-8`}>
          {/* Main Content */}
          <div className={`${user ? 'lg:col-span-3' : ''}`}>
            {/* Category Pills & View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in-up">
              <div className="flex flex-wrap gap-3">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-xl shadow-cyan-400/40 scale-105 border-2 border-cyan-300'
                        : 'bg-gray-100 text-gray-800 hover:bg-cyan-100 hover:text-cyan-700 border-2 border-gray-300 hover:border-cyan-400 shadow-lg'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-md border-2 border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-md' : 'text-gray-500 hover:text-cyan-600 hover:bg-cyan-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-md' : 'text-gray-500 hover:text-cyan-600 hover:bg-cyan-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Course Status Tabs - Removed from here, moved to bottom for enrolled courses section */}

            {/* Courses Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {availableCourses.map((course, index) => {
                const enrollment = user ? getEnrollment(user.id, course.id) : null;
                return (
                  <div
                    key={course.id}
                    onMouseEnter={() => setHoveredCard(course.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 animate-fade-in-up ${
                      viewMode === 'list' ? 'flex' : 'flex flex-col'
                    }`}
                    style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                  >
                    {/* Card Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-sky-500/20 to-slate-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 scale-105`}></div>
                    
                    {/* Image Container */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'}`}>
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {course.access === 'invitation' && !enrollment && (
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                            <Lock className="w-3 h-3" />
                            Invitation
                          </span>
                        )}
                        {course.access === 'open' && !enrollment && (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg">
                            Free
                          </span>
                        )}
                      </div>

                      {/* Progress Badge */}
                      {enrollment && (
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
                              <circle 
                                cx="28" cy="28" r="24" 
                                stroke="url(#progressGradient)" 
                                strokeWidth="4" 
                                fill="none"
                                strokeDasharray={`${enrollment.progress * 1.5} 150`}
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10B981" />
                                  <stop offset="100%" stopColor="#34D399" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                              {enrollment.progress}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors">
                          <Bookmark className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-5 flex flex-col flex-grow ${viewMode === 'list' ? 'py-4' : ''}`}>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {course.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                        {course.description}
                      </p>

                      {/* Course Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lessons.length} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{Math.ceil(course.lessons.reduce((acc, l) => acc + (l.duration || 10), 0) / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-4">
                        {course.access === 'payment' && !enrollment ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-600">
                            {enrollment ? (
                              <>
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium">{enrollment.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                <span className="font-medium">Free Access</span>
                              </>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleCourseAction(course)}
                          className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            course.access === 'payment' && !enrollment
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                              : course.access === 'invitation' && !enrollment
                              ? 'bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 hover:shadow-lg hover:shadow-sky-400/25'
                              : 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:shadow-lg hover:shadow-cyan-400/25'
                          }`}
                        >
                          {enrollment?.status === 'in-progress' ? (
                            <Play className="w-4 h-4" />
                          ) : enrollment?.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                          {getButtonText(course)}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {availableCourses.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? 'Try a different search term or category'
                    : 'No courses are currently available'}
                </p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Profile Panel (only for logged-in users) */}
          {user && (
            <div className="lg:col-span-1 animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="sticky top-28 space-y-6">
                {/* Profile Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-xl border border-white/50 p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                  
                  <Link to="/profile" className="block text-center mb-6 group cursor-pointer relative">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="relative w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mt-4 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </Link>

                  {/* XP Progress */}
                  <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-gray-800">Experience</span>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{user.points || 0} XP</span>
                    </div>
                    <div className="relative h-3 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out progress-animated"
                        style={{
                          width: nextBadge
                            ? `${((user.points || 0) / nextBadge.points) * 100}%`
                            : '100%',
                        }}
                      />
                    </div>
                    {nextBadge && (
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        <span className="font-semibold text-amber-600">{nextBadge.points - (user.points || 0)} XP</span> to {nextBadge.name}
                      </p>
                    )}
                  </div>

                  {/* Current Badge */}
                  {currentBadge && (
                    <div className="text-center">
                      <div
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300 hover:scale-105"
                        style={{ 
                          borderColor: currentBadge.color, 
                          backgroundColor: `${currentBadge.color}15`,
                        }}
                      >
                        <span className={currentBadge.color}><BadgeIcon iconName={currentBadge.icon} className="w-6 h-6" /></span>
                        <span className="font-bold text-lg" style={{ color: currentBadge.color }}>
                          {currentBadge.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Your Progress
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Enrolled</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {courses.filter(c => getEnrollment(user.id, c.id)).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Completed</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {courses.filter(c => getEnrollment(user.id, c.id)?.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Badges</span>
                      </div>
                      <span className="text-xl font-bold text-cyan-600">
                        {BADGE_LEVELS.filter(b => (user.points || 0) >= b.points).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge Progress */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Badge Journey
                  </h4>
                  <div className="space-y-3">
                    {BADGE_LEVELS.map((badge, index) => {
                      const achieved = (user.points || 0) >= badge.points;
                      const isNext = !achieved && BADGE_LEVELS[index - 1] && (user.points || 0) >= BADGE_LEVELS[index - 1].points;
                      return (
                        <div
                          key={badge.name}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            achieved 
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
                              : isNext 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' 
                              : 'opacity-40'
                          }`}
                        >
                          <span className={`${badge.color} ${achieved ? '' : 'grayscale opacity-50'}`}><BadgeIcon iconName={badge.icon} className="w-5 h-5" /></span>
                          <div className="flex-grow">
                            <p className="font-semibold text-sm text-gray-800">{badge.name}</p>
                            <p className="text-xs text-gray-500">{badge.points} XP</p>
                          </div>
                          {achieved && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {isNext && (
                            <Target className="w-5 h-5 text-blue-500 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Enrolled Courses Section - At Bottom */}
      <div ref={enrolledCoursesRef} className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">My Learning Journey</h2>
              <p className="text-gray-500 mt-1">Track your enrolled courses and progress</p>
            </div>
          </div>

          {user && statusCounts.all > 0 ? (
            <>
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2 mb-10 animate-fade-in-up pb-6 border-b-2 border-gray-200">
                {[
                  { id: 'all', label: 'All Courses', count: statusCounts.all, icon: BookOpen },
                  { id: 'ongoing', label: 'Ongoing', count: statusCounts.ongoing, icon: TrendingUp },
                  { id: 'finished', label: 'Finished', count: statusCounts.finished, icon: CheckCircle },
                  { id: 'timedout', label: 'Timed Out', count: statusCounts.timedout, icon: AlertCircle },
                  { id: 'discontinued', label: 'Discontinued', count: statusCounts.discontinued, icon: XCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = courseStatusFilter === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCourseStatusFilter(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-400/40 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border-2 border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-semibold">{tab.label}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-slate-950/20' : 'bg-gray-300/30'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Enrolled Courses Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {availableCourses.map((course, index) => {
                  const enrollment = user ? getEnrollment(user.id, course.id) : null;
                  // Only show enrolled courses by filtering out non-enrolled ones
                  if (!enrollment) return null;
                  
                  return (
                    <div
                      key={course.id}
                      onMouseEnter={() => setHoveredCard(course.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 animate-fade-in-up ${
                        viewMode === 'list' ? 'flex' : 'flex flex-col'
                      }`}
                      style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                    >
                      {/* Card Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-sky-500/20 to-slate-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10 scale-105`}></div>
                      
                      {/* Image Container */}
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'}`}>
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Status Badge */}
                        {enrollment && (
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1.5 rounded-full text-white text-xs font-bold backdrop-blur-sm ${
                              enrollment.status === 'in-progress' ? 'bg-blue-500/80' :
                              enrollment.status === 'completed' ? 'bg-green-500/80' :
                              enrollment.status === 'timed-out' ? 'bg-orange-500/80' :
                              'bg-gray-500/80'
                            }`}>
                              {enrollment.status === 'in-progress' ? '🔄 In Progress' :
                               enrollment.status === 'completed' ? '✓ Completed' :
                               enrollment.status === 'timed-out' ? '⏱ Timed Out' :
                               '⊘ Discontinued'}
                            </span>
                          </div>
                        )}

                        {/* Progress Badge */}
                        {enrollment && (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <svg className="w-14 h-14 transform -rotate-90">
                                <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
                                <circle 
                                  cx="28" cy="28" r="24" 
                                  stroke="url(#progressGradient)" 
                                  strokeWidth="4" 
                                  fill="none"
                                  strokeDasharray={`${enrollment.progress * 1.5} 150`}
                                  strokeLinecap="round"
                                />
                                <defs>
                                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#34D399" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                {enrollment.progress}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`p-5 flex flex-col flex-grow ${viewMode === 'list' ? 'py-4' : ''}`}>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {course.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                          {course.description}
                        </p>

                        {/* Course Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.lessons.length} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{Math.ceil(course.lessons.reduce((acc, l) => acc + (l.duration || 10), 0) / 60)}h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>4.8</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleCourseAction(course)}
                            className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                              enrollment?.status === 'in-progress'
                                ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:shadow-lg hover:shadow-cyan-400/40'
                                : enrollment?.status === 'completed'
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-slate-950 hover:shadow-lg hover:shadow-green-400/40'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {enrollment?.status === 'in-progress' ? (
                              <Play className="w-4 h-4" />
                            ) : enrollment?.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            {getButtonText(course)}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {availableCourses.filter(c => getEnrollment(user.id, c.id)).length === 0 && (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No courses in this category</h3>
                  <p className="text-gray-500 mb-6">Try selecting a different status tab</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses enrolled yet</h3>
              <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course above</p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Explore Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
