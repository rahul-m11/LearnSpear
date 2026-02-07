import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Eye,
  Play,
  Award,
  ArrowUp,
  ArrowDown,
  Target,
  PieChart,
  Activity,
  CheckCircle,
  Star,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Video,
  Flame,
  Bell,
  Trophy,
  User,
  Clapperboard,
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user, courses, enrollments, users } = useApp();
  const [timeRange, setTimeRange] = useState('month');

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  // Filter courses based on role
  const relevantCourses = useMemo(() => {
    if (isAdmin) return courses;
    // Show all courses to instructors as well to see global performance
    if (isInstructor) return courses;
    return courses;
  }, [courses, user, isAdmin, isInstructor]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCourses = relevantCourses.length;
    const publishedCourses = relevantCourses.filter((c) => c.published).length;
    const relevantEnrollments = enrollments.filter((e) =>
      relevantCourses.some((c) => c.id === e.courseId)
    );
    const totalEnrollments = relevantEnrollments.length;
    const completedEnrollments = relevantEnrollments.filter((e) => e.status === 'completed').length;
    const totalLearners = users.filter((u) => u.role === 'learner').length;

    const totalWatchMinutes = relevantCourses.reduce((acc, course) => {
      const courseDuration = course.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id).length;
      return acc + (courseDuration * courseEnrollments * 0.6);
    }, 0);
    const totalWatchHours = Math.round(totalWatchMinutes / 60);

    const totalRevenue = relevantCourses.reduce((acc, course) => {
      if (course.access === 'payment' && course.price > 0) {
        const purchases = enrollments.filter((e) => e.courseId === course.id).length;
        return acc + (course.price * purchases);
      }
      return acc;
    }, 0);

    const paidCoursesSold = relevantCourses
      .filter((c) => c.access === 'payment')
      .reduce((acc, course) => acc + enrollments.filter((e) => e.courseId === course.id).length, 0);

    const freeCourseEnrollments = relevantCourses
      .filter((c) => c.access !== 'payment')
      .reduce((acc, course) => acc + enrollments.filter((e) => e.courseId === course.id).length, 0);

    const totalViews = relevantCourses.reduce((acc, course) => acc + (course.views || 0), 0);
    const totalLessons = relevantCourses.reduce((acc, course) => acc + (course.lessons?.length || 0), 0);

    return {
      totalCourses, publishedCourses, totalEnrollments, completedEnrollments,
      totalLearners, totalWatchHours, totalRevenue, totalViews,
      paidCoursesSold, freeCourseEnrollments, totalLessons,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
    };
  }, [relevantCourses, enrollments, users]);

  // Course performance data
  const coursePerformance = useMemo(() => {
    return relevantCourses
      .filter((c) => c.published)
      .map((course) => {
        const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
        const completed = courseEnrollments.filter((e) => e.status === 'completed').length;
        const revenue = course.access === 'payment' ? course.price * courseEnrollments.length : 0;
        const watchHours = Math.round(
          (course.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0) * courseEnrollments.length * 0.6 / 60
        );
        return {
          id: course.id, title: course.title, image: course.image,
          enrollments: courseEnrollments.length, completed,
          completionRate: courseEnrollments.length > 0 ? Math.round((completed / courseEnrollments.length) * 100) : 0,
          views: course.views || 0, revenue, watchHours,
          price: course.price, isPaid: course.access === 'payment',
          lessons: course.lessons?.length || 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [relevantCourses, enrollments]);

  const topRevenueCourses = coursePerformance.filter((c) => c.isPaid).slice(0, 5);
  const topViewedCourses = [...coursePerformance].sort((a, b) => b.views - a.views).slice(0, 5);

  const monthlyData = useMemo(() => {
    let labels = [];
    let dataPoints = [];

    if (timeRange === 'week') {
      // Last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date().getDay();
      for (let i = 6; i >= 0; i--) {
        const dayIndex = (today - i + 7) % 7;
        labels.push(days[dayIndex]);
      }
      dataPoints = labels.map((day, index) => ({
        month: day,
        sales: Math.floor(Math.random() * 10) + 2 + index,
        revenue: Math.floor(Math.random() * 200) + 50 + (index * 20),
        enrollments: Math.floor(Math.random() * 15) + 3 + index,
        views: Math.floor(Math.random() * 150) + 30 + (index * 15),
      }));
    } else if (timeRange === 'month') {
      // Last 30 days (grouped by weeks)
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      dataPoints = labels.map((week, index) => ({
        month: week,
        sales: Math.floor(Math.random() * 20) + 5 + (index * 3),
        revenue: Math.floor(Math.random() * 400) + 100 + (index * 40),
        enrollments: Math.floor(Math.random() * 30) + 8 + (index * 4),
        views: Math.floor(Math.random() * 300) + 60 + (index * 30),
      }));
    } else if (timeRange === 'quarter') {
      // Last 3 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      for (let i = 2; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        labels.push(months[monthIndex]);
      }
      dataPoints = labels.map((month, index) => ({
        month,
        sales: Math.floor(Math.random() * 25) + 10 + (index * 5),
        revenue: Math.floor(Math.random() * 600) + 200 + (index * 60),
        enrollments: Math.floor(Math.random() * 40) + 15 + (index * 8),
        views: Math.floor(Math.random() * 400) + 100 + (index * 40),
      }));
    } else {
      // Full year - 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dataPoints = months.map((month, index) => ({
        month,
        sales: Math.floor(Math.random() * 30) + 5 + (index * 2),
        revenue: Math.floor(Math.random() * 800) + 200 + (index * 80),
        enrollments: Math.floor(Math.random() * 50) + 15 + (index * 4),
        views: Math.floor(Math.random() * 500) + 100 + (index * 50),
      }));
    }

    return dataPoints;
  }, [timeRange]);

  const categoryDistribution = useMemo(() => {
    const categories = {};
    relevantCourses.forEach((course) => {
      course.tags?.forEach((tag) => {
        categories[tag] = (categories[tag] || 0) + 1;
      });
    });
    return Object.entries(categories)
      .map(([name, count]) => ({
        name, count,
        percentage: Math.round((count / Math.max(relevantCourses.length, 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [relevantCourses]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {isAdmin ? <><BarChart3 className="w-8 h-8 text-blue-500" /> Admin Dashboard</> : <><User className="w-8 h-8 text-purple-500" /> Instructor Dashboard</>}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Platform-wide sales, revenue & performance analytics' : 'Track your courses performance and student engagement'}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* ADMIN DASHBOARD */}
      {isAdmin && (
        <>
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Total Revenue</p>
                  <p className="text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-green-200 text-sm flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 mr-1" />+23% from last month
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <DollarSign className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1 flex items-center gap-1"><ShoppingCart className="w-4 h-4" /> Courses Sold</p>
                  <p className="text-4xl font-bold">{stats.paidCoursesSold}</p>
                  <p className="text-blue-200 text-sm flex items-center mt-2">
                    <ShoppingCart className="w-4 h-4 mr-1" />{stats.freeCourseEnrollments} free enrollments
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <CreditCard className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm mb-1 flex items-center gap-1"><Users className="w-4 h-4" /> Total Students</p>
                  <p className="text-4xl font-bold">{stats.totalLearners}</p>
                  <p className="text-cyan-200 text-sm flex items-center mt-2">
                    <UserCheck className="w-4 h-4 mr-1" />{stats.totalEnrollments} enrollments
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Users className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 via-sky-500 to-slate-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm mb-1 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Completion Rate</p>
                  <p className="text-4xl font-bold">{stats.completionRate}%</p>
                  <p className="text-cyan-200 text-sm flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />{stats.completedEnrollments} completed
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Target className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart + Top Revenue Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <DollarSign className="w-5 h-5 text-green-500" /> Revenue & Sales Trends
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Revenue ($)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Sales</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 gap-2">
                {monthlyData.map((data) => {
                  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                  const maxSales = Math.max(...monthlyData.map(d => d.sales));
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center gap-1 h-52 justify-end">
                        <div 
                          className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer" 
                          style={{ height: `${(data.revenue / maxRevenue) * 100}%` }} 
                          title={`Revenue: $${data.revenue}`}
                        ></div>
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer" 
                          style={{ height: `${(data.sales / maxSales) * 100}%` }} 
                          title={`Sales: ${data.sales}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-500" />
                <Trophy className="w-5 h-5 text-yellow-500" /> Top Revenue Courses
              </h3>
              <div className="space-y-4">
                {topRevenueCourses.length > 0 ? topRevenueCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                      {index + 1}
                    </div>
                    <img src={course.image} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.enrollments} sold × ${course.price}</p>
                    </div>
                    <p className="font-bold text-green-600">${course.revenue.toFixed(0)}</p>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No paid courses yet</p>}
              </div>
            </div>
          </div>

          {/* Sales Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                <TrendingUp className="w-5 h-5 text-blue-500" /> Course Sales Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Units Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coursePerformance.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={course.image} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.lessons} lessons</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${course.isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                          {course.isPaid ? `$${course.price}` : 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{course.enrollments}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">${course.revenue.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${course.completionRate >= 70 ? 'bg-green-500' : course.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${course.completionRate}%` }} />
                          </div>
                          <span className="text-sm text-gray-600">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {course.revenue > 100 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <TrendingUp className="w-3 h-3" /> High Performer
                          </span>
                        ) : course.revenue > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            <ArrowUp className="w-3 h-3" /> Growing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            <ArrowDown className="w-3 h-3" /> Free Course
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INSTRUCTOR DASHBOARD */}
      {isInstructor && (
        <>
          {/* Instructor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1 flex items-center gap-1"><BookOpen className="w-4 h-4" /> My Courses</p>
                  <p className="text-4xl font-bold">{stats.totalCourses}</p>
                  <p className="text-blue-200 text-sm flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />{stats.publishedCourses} published
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <BookOpen className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm mb-1 flex items-center gap-1"><Eye className="w-4 h-4" /> Total Views</p>
                  <p className="text-4xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-cyan-200 text-sm flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 mr-1" />+18% this month
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Eye className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1 flex items-center gap-1"><UserCheck className="w-4 h-4" /> Students Enrolled</p>
                  <p className="text-4xl font-bold">{stats.totalEnrollments}</p>
                  <p className="text-green-200 text-sm flex items-center mt-2">
                    <UserCheck className="w-4 h-4 mr-1" />{stats.completedEnrollments} completed
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Users className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 via-sky-500 to-slate-600 rounded-xl shadow-lg p-6 text-white hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm mb-1 flex items-center gap-1"><Clapperboard className="w-4 h-4" /> Total Lessons</p>
                  <p className="text-4xl font-bold">{stats.totalLessons}</p>
                  <p className="text-cyan-200 text-sm flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-1" />{stats.totalWatchHours}h watch time
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Video className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Views Chart + Most Viewed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <BarChart3 className="w-5 h-5 text-blue-500" /> Views & Enrollments
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-600">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Enrollments</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between h-64 gap-2">
                {monthlyData.map((data) => {
                  const maxViews = Math.max(...monthlyData.map(d => d.views));
                  const maxEnrollments = Math.max(...monthlyData.map(d => d.enrollments));
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center gap-1 h-52 justify-end">
                        <div 
                          className="w-full bg-purple-400 rounded-t transition-all duration-500 hover:bg-purple-500 cursor-pointer" 
                          style={{ height: `${(data.views / maxViews) * 100}%` }} 
                          title={`Views: ${data.views}`}
                        ></div>
                        <div 
                          className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer" 
                          style={{ height: `${(data.enrollments / maxEnrollments) * 100}%` }} 
                          title={`Enrollments: ${data.enrollments}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <Flame className="w-5 h-5 text-orange-500" /> Most Viewed Courses
              </h3>
              <div className="space-y-4">
                {topViewedCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-purple-400' : index === 2 ? 'bg-purple-300' : 'bg-gray-300'}`}>
                      {index + 1}
                    </div>
                    <img src={course.image} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.enrollments} students</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{course.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                My Courses Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Watch Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coursePerformance.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={course.image} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.lessons} lessons</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-gray-900">{course.views.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-gray-900">{course.enrollments}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-900">{course.watchHours}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${course.completionRate >= 70 ? 'bg-green-500' : course.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${course.completionRate}%` }} />
                          </div>
                          <span className="text-sm text-gray-600">{course.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary-500" />
                Course Categories
              </h3>
              <div className="space-y-3">
                {categoryDistribution.map((cat, index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                      <span className="flex-1 text-gray-700">{cat.name}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[index % colors.length]}`} style={{ width: `${cat.percentage}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">{cat.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary-500" />
                <Bell className="w-5 h-5 text-yellow-500" /> Recent Student Activity
              </h3>
              <div className="space-y-4">
                {[
                  { icon: UserCheck, color: 'bg-green-100 text-green-600', text: 'New student enrolled in your React course', time: '5 mins ago' },
                  { icon: CheckCircle, color: 'bg-blue-100 text-blue-600', text: 'Student completed "What is React?" lesson', time: '20 mins ago' },
                  { icon: Star, color: 'bg-yellow-100 text-yellow-600', text: 'New 5-star review received', time: '1 hour ago' },
                  { icon: Play, color: 'bg-purple-100 text-purple-600', text: 'Video lesson watched 15 times today', time: '2 hours ago' },
                  { icon: Award, color: 'bg-pink-100 text-pink-600', text: 'Student earned course completion badge', time: '3 hours ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
