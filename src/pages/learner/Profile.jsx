import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, BADGE_LEVELS } from '../../context/AppContext';
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Target,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  Activity,
  ChevronRight,
  Edit3,
  Settings,
  ArrowLeft,
  Play,
  Medal,
  Crown,
  Shield,
  Gift,
  Timer,
  Percent,
  Brain,
  Rocket,
  Heart,
  Sparkles,
  Camera,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Globe,
  Sprout,
  Search,
  Gem,
  GraduationCap,
  Share2,
  Download,
  Copy,
  Facebook,
  Send,
  Check,
  Lock,
  X,
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

const Profile = () => {
  const { user, courses, enrollments, getUserBadge, quizzes } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Activity data for heatmap (last 365 days)
  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Simulate activity based on random + enrollments
      const activity = Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0;
      data.push({ date: date.toISOString().split('T')[0], count: activity });
    }
    return data;
  };

  const activityData = useMemo(() => generateActivityData(), []);

  // Get user's enrollments (for learners) - needs to be before conditional return for useMemo
  const userEnrollments = user ? enrollments.filter((e) => e.userId === user.id) : [];
  const enrolledCourses = userEnrollments.map((e) => ({
    ...courses.find((c) => c.id === e.courseId),
    enrollment: e,
  }));

  // Skills based on enrolled courses
  const skills = useMemo(() => {
    const tagCounts = {};
    enrolledCourses.forEach((course) => {
      course?.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({
        name,
        level: Math.min(count * 20 + Math.floor(Math.random() * 30), 100),
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 6);
  }, [enrolledCourses]);

  // Early return AFTER all hooks
  if (!user) {
    navigate('/login');
    return null;
  }

  // Role checks
  const isAdmin = user.role === 'admin';
  const isInstructor = user.role === 'instructor';
  const isLearner = user.role === 'learner' || (!isAdmin && !isInstructor);

  const currentBadge = getUserBadge(user.points || 0);
  const nextBadge = BADGE_LEVELS.find((b) => b.points > (user.points || 0));
  const progressToNext = nextBadge
    ? ((user.points - (BADGE_LEVELS[BADGE_LEVELS.indexOf(nextBadge) - 1]?.points || 0)) /
        (nextBadge.points - (BADGE_LEVELS[BADGE_LEVELS.indexOf(nextBadge) - 1]?.points || 0))) *
      100
    : 100;

  // Admin/Instructor specific data
  const adminCourses = isAdmin ? courses : courses.filter(c => c.instructorId === user.id || c.responsibleId === user.id || c.adminId === user.id);
  const totalRevenue = adminCourses.reduce((acc, course) => {
    const courseSales = enrollments.filter(e => e.courseId === course.id).length;
    const price = parseFloat(course.price) || 0;
    return acc + (courseSales * price);
  }, 0);
  const totalCoursesSold = adminCourses.reduce((acc, course) => {
    return acc + enrollments.filter(e => e.courseId === course.id).length;
  }, 0);
  const totalStudents = isAdmin 
    ? [...new Set(enrollments.map(e => e.userId))].length
    : [...new Set(enrollments.filter(e => adminCourses.some(c => c.id === e.courseId)).map(e => e.userId))].length;
  const avgCompletionRate = Math.round(
    enrollments.filter(e => adminCourses.some(c => c.id === e.courseId))
      .reduce((acc, e) => acc + (e.progress || 0), 0) / 
    Math.max(enrollments.filter(e => adminCourses.some(c => c.id === e.courseId)).length, 1)
  );

  // Top performing courses for admin
  const topCourses = adminCourses.map(course => {
    const sales = enrollments.filter(e => e.courseId === course.id).length;
    const revenue = sales * (course.price || 0);
    return { ...course, sales, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Stats
  const completedCourses = userEnrollments.filter((e) => e.status === 'completed').length;
  const inProgressCourses = userEnrollments.filter((e) => e.status === 'in-progress').length;
  const totalLessonsCompleted = userEnrollments.reduce(
    (acc, e) => acc + (e.completedLessons?.length || 0),
    0
  );
  const totalQuizzesPassed = userEnrollments.reduce(
    (acc, e) => acc + (e.completedLessons?.filter((l) => l.toString().includes('quiz')).length || 0),
    0
  );

  // Calculate learning time (simulated)
  const totalLearningHours = Math.round(
    enrolledCourses.reduce((acc, course) => {
      const courseDuration = course?.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;
      const progress = course?.enrollment?.progress || 0;
      return acc + (courseDuration * progress / 100);
    }, 0) / 60
  );

  // Learning streak (simulated - 7 days)
  const learningStreak = 7;
  const todayLearningMinutes = 45;

  // Overall progress
  const overallProgress = userEnrollments.length > 0
    ? Math.round(userEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / userEnrollments.length)
    : 0;

  // Achievements
  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Enroll in your first course',
      icon: Star,
      unlocked: userEnrollments.length >= 1,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100',
    },
    {
      id: 2,
      name: 'Course Completer',
      description: 'Complete your first course',
      icon: CheckCircle,
      unlocked: completedCourses >= 1,
      color: 'text-green-500',
      bg: 'bg-green-100',
    },
    {
      id: 3,
      name: 'Knowledge Seeker',
      description: 'Enroll in 5 courses',
      icon: BookOpen,
      unlocked: userEnrollments.length >= 5,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      id: 4,
      name: 'Quiz Master',
      description: 'Pass 5 quizzes',
      icon: Target,
      unlocked: totalQuizzesPassed >= 5,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
    },
    {
      id: 5,
      name: 'Point Collector',
      description: 'Earn 50 points',
      icon: Zap,
      unlocked: user.points >= 50,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
    },
    {
      id: 6,
      name: 'Dedicated Learner',
      description: 'Complete 10 lessons',
      icon: Flame,
      unlocked: totalLessonsCompleted >= 10,
      color: 'text-red-500',
      bg: 'bg-red-100',
    },
    {
      id: 7,
      name: 'Rising Star',
      description: 'Reach Explorer badge',
      icon: Medal,
      unlocked: BADGE_LEVELS.indexOf(currentBadge) >= 1,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100',
    },
    {
      id: 8,
      name: 'Master Scholar',
      description: 'Complete 5 courses',
      icon: Crown,
      unlocked: completedCourses >= 5,
      color: 'text-amber-500',
      bg: 'bg-amber-100',
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  // Generate certificates for completed courses
  const certificates = enrolledCourses
    .filter(course => course?.enrollment?.status === 'completed')
    .map((course, index) => ({
      id: `cert-${course.id}`,
      courseTitle: course.title,
      courseDuration: course.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0,
      completedDate: course.enrollment.completedAt || new Date().toISOString(),
      instructorName: course.instructor,
      certificateNumber: `LS-${String(user.id).padStart(4, '0')}-${String(course.id).padStart(4, '0')}-2026`,
      grade: course.enrollment.grade || 'A',
      skills: course.tags || [],
    }));

  // Share certificate function
  const shareCertificate = (certificate, platform) => {
    const certificateUrl = `${window.location.origin}/certificate/${certificate.id}`;
    const shareText = `I just completed "${certificate.courseTitle}" on LearnSphere! 🎓✨`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(certificateUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(certificateUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Download certificate function
  const downloadCertificate = (certificate) => {
    // In a real app, this would generate a PDF
    alert(`Downloading certificate for "${certificate.courseTitle}"...\nThis would generate a PDF in production.`);
  };

  // Get activity level color
  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    if (count === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  // Weekly activity summary
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 ${
          isAdmin 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : isInstructor 
            ? 'bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800' 
            : 'bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800'
        }`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl"></div>
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Courses</span>
          </Link>

          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 p-1 shadow-2xl backdrop-blur-sm">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
              {/* Badge Indicator */}
              {isLearner && (
                <div className="absolute -bottom-3 -right-3 p-3 bg-white rounded-xl shadow-lg">
                  <div className={`${currentBadge.color}`}><BadgeIcon iconName={currentBadge.icon} className="w-8 h-8" /></div>
                </div>
              )}
              {isAdmin && (
                <div className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              )}
              {isInstructor && (
                <div className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-br from-pink-500 to-fuchsia-500 rounded-xl shadow-lg">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              )}
              {/* Edit Button */}
              <button className="absolute top-2 right-2 p-2 bg-black/30 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{user.name}</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
                  isAdmin ? 'bg-red-500/30 text-red-200 border border-red-400/30' :
                  isInstructor ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/30' :
                  'bg-green-500/30 text-green-200 border border-green-400/30'
                }`}>
                  {isAdmin ? <><Shield className="w-4 h-4" /> Administrator</> : isInstructor ? <><User className="w-4 h-4" /> Instructor</> : <><GraduationCap className="w-4 h-4" /> Learner</>}
                </span>
                {isLearner && learningStreak >= 7 && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {learningStreak} Day Streak!
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/70 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2026</span>
                </div>
              </div>

              {/* Quick Stats Cards */}
              {isAdmin || isInstructor ? (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                      <div className="text-xs text-white/60">Total Revenue</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{adminCourses.length}</div>
                      <div className="text-xs text-white/60">{isAdmin ? 'Total Courses' : 'My Courses'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalCoursesSold}</div>
                      <div className="text-xs text-white/60">Courses Sold</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalStudents}</div>
                      <div className="text-xs text-white/60">Students</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user.points || 0}</div>
                      <div className="text-xs text-white/60">XP Points</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{learningStreak}</div>
                      <div className="text-xs text-white/60">Day Streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Timer className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalLearningHours}h</div>
                      <div className="text-xs text-white/60">Learned</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{userEnrollments.length}</div>
                      <div className="text-xs text-white/60">Courses</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{completedCourses}</div>
                      <div className="text-xs text-white/60">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{unlockedAchievements}/{achievements.length}</div>
                      <div className="text-xs text-white/60">Badges</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10">
                <Edit3 className="w-5 h-5 text-white" />
              </button>
              <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {(isAdmin || isInstructor ? [
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'courses', label: 'Manage Courses', icon: BookOpen },
              { id: 'activity', label: 'Sales History', icon: Activity },
            ] : [
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'activity', label: 'Activity', icon: Activity },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Admin/Instructor Dashboard Content */}
              {(isAdmin || isInstructor) ? (
                <>
                  {/* Revenue Overview Card */}
                  <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-xl p-8 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-6 h-6" />
                            </div>
                            Revenue Overview
                          </h3>
                          <p className="text-white/70 mt-1">Your earnings summary</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold">${totalRevenue.toFixed(2)}</div>
                          <div className="text-white/70 text-sm">Total Revenue</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <BookOpen className="w-7 h-7 mx-auto mb-2 text-blue-200" />
                          <div className="text-2xl font-bold">{adminCourses.length}</div>
                          <div className="text-xs text-white/70">{isAdmin ? 'Total Courses' : 'My Courses'}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Target className="w-7 h-7 mx-auto mb-2 text-orange-200" />
                          <div className="text-2xl font-bold">{totalCoursesSold}</div>
                          <div className="text-xs text-white/70">Units Sold</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <User className="w-7 h-7 mx-auto mb-2 text-purple-200" />
                          <div className="text-2xl font-bold">{totalStudents}</div>
                          <div className="text-xs text-white/70">Total Students</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Percent className="w-7 h-7 mx-auto mb-2 text-green-200" />
                          <div className="text-2xl font-bold">{avgCompletionRate}%</div>
                          <div className="text-xs text-white/70">Avg Completion</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Earning Courses */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      Top Earning Courses
                    </h3>
                    {topCourses.length > 0 ? (
                      <div className="space-y-4">
                        {topCourses.map((course, index) => (
                          <div key={course.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-200 text-gray-600' :
                              index === 2 ? 'bg-cyan-100 text-cyan-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                            <img src={course.image} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{course.title}</div>
                              <div className="text-sm text-gray-500">{course.sales} sales</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">${course.revenue.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">${course.price}/unit</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No courses yet. Create your first course!</p>
                    )}
                  </div>

                  {/* Revenue Chart Placeholder */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Revenue by Course
                    </h3>
                    <div className="space-y-3">
                      {topCourses.slice(0, 5).map((course) => {
                        const maxRevenue = Math.max(...topCourses.map(c => c.revenue), 1);
                        const percentage = (course.revenue / maxRevenue) * 100;
                        return (
                          <div key={course.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700 truncate max-w-[200px]">{course.title}</span>
                              <span className="text-gray-900 font-semibold">${course.revenue.toLocaleString()}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Learner: Today's Progress Banner */}
                  <div className="relative bg-gradient-to-br from-slate-700 via-cyan-600 to-sky-700 rounded-3xl shadow-xl p-8 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <Rocket className="w-6 h-6" />
                            </div>
                            Today's Learning
                          </h3>
                          <p className="text-white/70 mt-1">Keep up the great work!</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold">{todayLearningMinutes} min</div>
                          <div className="text-white/70 text-sm">of learning today</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Flame className="w-7 h-7 mx-auto mb-2 text-orange-300" />
                          <div className="text-2xl font-bold">{learningStreak}</div>
                          <div className="text-xs text-white/70">Day Streak</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Percent className="w-7 h-7 mx-auto mb-2 text-green-300" />
                          <div className="text-2xl font-bold">{overallProgress}%</div>
                          <div className="text-xs text-white/70">Overall Progress</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Brain className="w-7 h-7 mx-auto mb-2 text-cyan-300" />
                          <div className="text-2xl font-bold">{skills.length}</div>
                          <div className="text-xs text-white/70">Skills Learned</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/30 transition-colors">
                          <Heart className="w-7 h-7 mx-auto mb-2 text-red-300" />
                          <div className="text-2xl font-bold">{totalLearningHours}h</div>
                          <div className="text-xs text-white/70">Total Hours</div>
                        </div>
                      </div>

                      {/* Daily Goal Progress */}
                      <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="flex items-center gap-2 font-medium">
                            <Target className="w-5 h-5" /> Daily Goal: 60 minutes
                          </span>
                          <span className="font-bold">{Math.min(todayLearningMinutes, 60)}/60 min</span>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500 relative progress-animated"
                            style={{ width: `${Math.min((todayLearningMinutes / 60) * 100, 100)}%` }}
                          />
                        </div>
                        {todayLearningMinutes >= 60 && (
                          <div className="text-center mt-3 text-sm flex items-center justify-center gap-2 bg-green-500/30 rounded-xl py-2">
                            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                            <span className="font-medium">Daily goal achieved! +10 bonus points</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge Progress */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      Badge Progress
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={currentBadge.color}><BadgeIcon iconName={currentBadge.icon} className="w-10 h-10" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">{currentBadge.name}</span>
                          {nextBadge && (
                            <span className="text-sm text-gray-500">
                              {nextBadge.points - user.points} pts to {nextBadge.name}
                            </span>
                          )}
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                            style={{ width: `${progressToNext}%` }}
                          />
                        </div>
                      </div>
                      {nextBadge && <div className="opacity-30"><BadgeIcon iconName={nextBadge.icon} className="w-10 h-10 text-gray-400" /></div>}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {BADGE_LEVELS.map((badge, index) => (
                        <div
                          key={badge.name}
                          className={`text-center p-2 rounded-lg transition-all ${
                            BADGE_LEVELS.indexOf(currentBadge) >= index
                              ? 'bg-primary-50'
                              : 'bg-gray-50 opacity-50'
                          }`}
                        >
                          <div className="mb-1"><BadgeIcon iconName={badge.icon} className={`w-6 h-6 mx-auto ${badge.color}`} /></div>
                          <div className="text-xs font-medium text-gray-700">{badge.name}</div>
                          <div className="text-xs text-gray-500">{badge.points}pts</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Heatmap */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Learning Activity
                    </h3>
                    <div className="text-sm text-gray-600 mb-3">
                      {activityData.filter((d) => d.count > 0).length} active days in the last year
                    </div>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-1 min-w-max">
                        {/* Group by weeks */}
                        {Array.from({ length: 52 }, (_, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }, (_, dayIndex) => {
                              const dataIndex = weekIndex * 7 + dayIndex;
                              const data = activityData[dataIndex];
                              if (!data) return null;
                              return (
                                <div
                                  key={dayIndex}
                                  className={`w-3 h-3 rounded-sm ${getActivityColor(
                                    data.count
                                  )} hover:ring-2 hover:ring-primary-300 cursor-pointer transition-all`}
                                  title={`${data.date}: ${data.count} activities`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
                          />
                        ))}
                      </div>
                      <span>More</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Skills
                    </h3>
                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skills.map((skill) => (
                          <div key={skill.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{skill.name}</span>
                              <span className="text-gray-500">{skill.level}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-700"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Enroll in courses to build your skills!
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Admin/Instructor Right Column */}
              {(isAdmin || isInstructor) ? (
                <>
                  {/* Quick Stats Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700">Total Revenue</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">{isAdmin ? 'All Courses' : 'My Courses'}</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{adminCourses.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Target className="w-5 h-5 text-cyan-600" />
                          </div>
                          <span className="text-gray-700">Units Sold</span>
                        </div>
                        <span className="text-xl font-bold text-cyan-600">{totalCoursesSold}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">Total Students</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">{totalStudents}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Goal */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Monthly Goal</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">Reach $10,000 in revenue this month</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" 
                          style={{ width: `${Math.min((totalRevenue / 10000) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{Math.round((totalRevenue / 10000) * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>${totalRevenue.toLocaleString()} / $10,000</span>
                      <span>22 days left</span>
                    </div>
                  </div>

                  {/* Recent Sales */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="text-primary-600 text-sm hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {topCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={course.image} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">{course.title}</div>
                            <div className="text-xs text-gray-500">{course.sales} units sold</div>
                          </div>
                          <span className="text-green-600 font-semibold text-sm">${course.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Learner: Leaderboard Position */}
                  <div className="bg-gradient-to-br from-cyan-400 via-sky-500 to-slate-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-8 h-8" />
                      <div>
                        <h3 className="font-bold text-lg">Leaderboard</h3>
                        <p className="text-white/80 text-sm">Your current ranking</p>
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <div className="text-5xl font-bold mb-1">#42</div>
                      <div className="text-white/80 text-sm">out of 1,234 learners</div>
                    </div>
                    <div className="flex justify-between text-sm pt-4 border-t border-white/20">
                      <div className="text-center">
                        <div className="font-bold">{user.points || 0}</div>
                        <div className="text-white/80 text-xs">Your Points</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">2,450</div>
                        <div className="text-white/80 text-xs">To Next Rank</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">↑ 5</div>
                        <div className="text-white/80 text-xs">This Week</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">Total Courses</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{userEnrollments.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-gray-700">Completed</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{completedCourses}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <span className="text-gray-700">In Progress</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">{inProgressCourses}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Play className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">Lessons Done</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">{totalLessonsCompleted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Challenge */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900">Weekly Challenge</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">Complete 5 lessons this week to earn bonus XP!</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">3/5</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Reward: +50 XP</span>
                      <span>3 days left</span>
                    </div>
                  </div>

                  {/* Current Badge Status */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        Current Badge
                      </h3>
                      <button
                        onClick={() => setActiveTab('achievements')}
                        className="text-purple-600 text-sm hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-20 rounded-xl ${currentBadge.color} shadow-lg flex items-center justify-center`}>
                        <BadgeIcon iconName={currentBadge.icon} className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xl text-gray-900 mb-1">{currentBadge.name}</div>
                        <p className="text-sm text-gray-600 mb-2">{currentBadge.description}</p>
                        {nextBadge && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Next: {nextBadge.name}</span>
                              <span className="font-semibold text-purple-600">{user.points}/{nextBadge.points} XP</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                style={{ width: `${Math.min(progressToNext, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                      <button
                        onClick={() => setActiveTab('achievements')}
                        className="text-primary-600 text-sm hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {achievements
                        .filter((a) => a.unlocked)
                        .slice(0, 3)
                        .map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-gray-100 transition-colors"
                          >
                            <div className={`p-2 ${achievement.bg} rounded-lg`}>
                              <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{achievement.name}</div>
                              <div className="text-xs text-gray-500">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                      {achievements.filter((a) => a.unlocked).length === 0 && (
                        <p className="text-gray-500 text-center py-4 text-sm">
                          Start learning to unlock achievements!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recent Certificates */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-cyan-600" />
                        Certificates
                      </h3>
                      <button
                        onClick={() => setActiveTab('certificates')}
                        className="text-cyan-600 text-sm hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    {certificates.length > 0 ? (
                      <div className="space-y-3">
                        {certificates.slice(0, 2).map((cert) => (
                          <div
                            key={cert.id}
                            className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setSelectedCertificate(cert)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{cert.courseTitle}</div>
                                <div className="text-xs text-gray-500">
                                  Completed {new Date(cert.completedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                          <Award className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm mb-3">No certificates yet</p>
                        <Link
                          to="/courses"
                          className="text-cyan-600 text-sm font-medium hover:underline"
                        >
                          Start Learning →
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="animate-fade-in">
            {(isAdmin || isInstructor) ? (
              /* Admin/Instructor Course Management */
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isAdmin ? 'All Platform Courses' : 'My Created Courses'}
                  </h2>
                  <Link
                    to="/admin/courses/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Create Course
                  </Link>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adminCourses.map((course) => {
                        const sales = enrollments.filter(e => e.courseId === course.id).length;
                        const revenue = sales * (course.price || 0);
                        return (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img src={course.image} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                  <div className="font-medium text-gray-900">{course.title}</div>
                                  <div className="text-sm text-gray-500">{course.lessons?.length || 0} lessons</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">${course.price || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{sales}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">${revenue.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {adminCourses.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                      <p className="text-gray-500">Create your first course to start earning!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Learner Enrolled Courses */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="relative h-40">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                        {course.enrollment.progress}%
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{course.lessons?.length || 0} lessons</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            course.enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {course.enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            course.enrollment.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-primary-500'
                          }`}
                          style={{ width: `${course.enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
                {enrolledCourses.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                    <p className="text-gray-500 mb-4">Start learning by enrolling in a course!</p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && isLearner && (
          <div className="animate-fade-in space-y-6">
            {/* Badges Showcase */}
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-sm border border-purple-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    Your Badge Collection
                  </h3>
                  <p className="text-gray-500 mt-1">Unlock badges by earning XP points</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {user.points} XP
                  </div>
                  <p className="text-sm text-gray-500">Current Points</p>
                </div>
              </div>
              
              {/* Current Badge with Progress */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-purple-200">
                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-2xl ${currentBadge.color} bg-gradient-to-br p-1 shadow-lg`}>
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                      <BadgeIcon iconName={currentBadge.icon} className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-2xl font-bold text-gray-900">{currentBadge.name}</h4>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                        Level {BADGE_LEVELS.indexOf(currentBadge) + 1}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{currentBadge.description}</p>
                    {nextBadge && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress to {nextBadge.name}</span>
                          <span className="font-semibold text-purple-600">
                            {user.points}/{nextBadge.points} XP
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressToNext, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Badges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {BADGE_LEVELS.map((badge, index) => {
                  const isUnlocked = user.points >= badge.points;
                  return (
                    <div
                      key={badge.name}
                      className={`relative bg-white rounded-xl p-4 text-center transition-all border-2 ${
                        isUnlocked
                          ? 'border-purple-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                          : 'border-gray-200 opacity-50'
                      }`}
                    >
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl ${badge.color} ${isUnlocked ? 'shadow-md' : 'grayscale'} flex items-center justify-center`}>
                        <BadgeIcon iconName={badge.icon} className="w-8 h-8" />
                      </div>
                      <h5 className="font-semibold text-gray-900 text-sm mb-1">{badge.name}</h5>
                      <p className="text-xs text-gray-500">{badge.points} XP</p>
                      {isUnlocked && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Unlocked
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Achievements
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {unlockedAchievements}/{achievements.length} Unlocked
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 text-center transition-all ${
                      achievement.unlocked
                        ? 'hover:shadow-md'
                        : 'opacity-50 grayscale'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? achievement.bg : 'bg-gray-100'
                      }`}
                    >
                      <achievement.icon
                        className={`w-8 h-8 ${
                          achievement.unlocked ? achievement.color : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                    {achievement.unlocked && (
                      <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && isLearner && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Certificates</h2>
                  <p className="text-gray-600">View, download, and share your achievements</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                    {certificates.length}
                  </div>
                  <p className="text-sm text-gray-500">Certificates Earned</p>
                </div>
              </div>
            </div>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Certificate Preview */}
                    <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-8 text-white">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      }}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-6 h-6" />
                              <span className="text-sm font-semibold">CERTIFICATE OF COMPLETION</span>
                            </div>
                            <h3 className="text-2xl font-bold">{certificate.courseTitle}</h3>
                          </div>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                            <span className="text-2xl font-bold">{certificate.grade}</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-white/90 text-sm">
                          <p><strong>Student:</strong> {user.name}</p>
                          <p><strong>Completed:</strong> {new Date(certificate.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p><strong>Duration:</strong> {Math.floor(certificate.courseDuration / 60)} hours</p>
                          <p><strong>Certificate #:</strong> {certificate.certificateNumber}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {certificate.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gray-50">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedCertificate(certificate)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          View Certificate
                        </button>
                        <button
                          onClick={() => downloadCertificate(certificate)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowShareMenu(showShareMenu === certificate.id ? null : certificate.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          
                          {showShareMenu === certificate.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-20 animate-scale-in">
                              <div className="text-xs font-semibold text-gray-500 px-3 py-2">Share this certificate</div>
                              <button
                                onClick={() => shareCertificate(certificate, 'linkedin')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                              >
                                <Linkedin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Share on LinkedIn</span>
                              </button>
                              <button
                                onClick={() => shareCertificate(certificate, 'twitter')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                              >
                                <Twitter className="w-4 h-4 text-sky-500" />
                                <span className="text-sm">Share on Twitter</span>
                              </button>
                              <button
                                onClick={() => shareCertificate(certificate, 'facebook')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                              >
                                <Facebook className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Share on Facebook</span>
                              </button>
                              <div className="border-t border-gray-200 my-2"></div>
                              <button
                                onClick={() => shareCertificate(certificate, 'copy')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                {copiedLink ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600">Link Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span className="text-sm">Copy Link</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Award className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
                <p className="text-gray-500 mb-6">Complete courses to earn certificates and showcase your achievements!</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Courses
                </Link>
              </div>
            )}

            {/* Certificate Modal */}
            {selectedCertificate && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCertificate(null)}>
                <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  {/* Certificate Full View */}
                  <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-12 text-white rounded-t-3xl">
                    <button
                      onClick={() => setSelectedCertificate(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border-4 border-white/40">
                        <Award className="w-10 h-10" />
                      </div>
                      <h2 className="text-4xl font-bold mb-2">Certificate of Completion</h2>
                      <p className="text-white/80">This is to certify that</p>
                    </div>

                    <div className="text-center mb-8">
                      <h3 className="text-5xl font-bold mb-6 border-b-4 border-white/40 inline-block pb-2">{user.name}</h3>
                      <p className="text-xl text-white/90 mb-4">has successfully completed the course</p>
                      <h4 className="text-3xl font-bold mb-6">{selectedCertificate.courseTitle}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-center mb-8">
                      <div>
                        <p className="text-white/70 text-sm mb-1">Completed On</p>
                        <p className="font-semibold">{new Date(selectedCertificate.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Duration</p>
                        <p className="font-semibold">{Math.floor(selectedCertificate.courseDuration / 60)} Hours</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-1">Grade</p>
                        <p className="font-semibold text-2xl">{selectedCertificate.grade}</p>
                      </div>
                    </div>

                    <div className="text-center border-t border-white/20 pt-6">
                      <p className="text-white/70 text-sm mb-2">Certificate Number</p>
                      <p className="font-mono font-semibold">{selectedCertificate.certificateNumber}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-b-3xl flex justify-center gap-4">
                    <button
                      onClick={() => downloadCertificate(selectedCertificate)}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Certificate
                    </button>
                    <button
                      onClick={() => {
                        setShowShareMenu(selectedCertificate.id);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="animate-fade-in space-y-6">
            {(isAdmin || isInstructor) ? (
              /* Admin/Instructor Sales History */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrollments
                        .filter(e => isAdmin || adminCourses.some(c => c.id === e.courseId))
                        .slice(0, 10)
                        .map((enrollment, index) => {
                          const course = courses.find(c => c.id === enrollment.courseId);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-600">Feb {7 - index}, 2026</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <img src={course?.image} alt="" className="w-8 h-8 rounded object-cover" />
                                  <span className="text-sm font-medium text-gray-900">{course?.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">Student #{enrollment.userId}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-600">${course?.price || 0}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {enrollments.filter(e => isAdmin || adminCourses.some(c => c.id === e.courseId)).length === 0 && (
                    <div className="text-center py-8 text-gray-500">No sales yet</div>
                  )}
                </div>
              </div>
            ) : (
              /* Learner Activity Timeline */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {userEnrollments.slice(0, 5).map((enrollment, index) => {
                    const course = courses.find((c) => c.id === enrollment.courseId);
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <BookOpen className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">
                            {enrollment.status === 'completed' ? 'Completed' : 'Enrolled in'}{' '}
                            <Link
                              to={`/courses/${course?.id}`}
                              className="font-medium text-primary-600 hover:underline"
                            >
                              {course?.title}
                            </Link>
                          </p>
                          <p className="text-sm text-gray-500">
                            Progress: {enrollment.progress}% • {enrollment.completedLessons?.length || 0}{' '}
                            lessons completed
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">Recently</span>
                      </div>
                    );
                  })}
                  {userEnrollments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No activity yet. Start learning!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
