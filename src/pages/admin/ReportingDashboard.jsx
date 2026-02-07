import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Play, Clock, CheckCircle, Settings } from 'lucide-react';

const ReportingDashboard = () => {
  const { user, enrollments, courses, users } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');
  const [visibleColumns, setVisibleColumns] = useState({
    coursePrice: true,
    participant: true,
    enrolledDate: true,
    startDate: true,
    timeSpent: true,
    completion: true,
    completedDate: true,
    status: true,
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  // Filter courses based on role
  const relevantCourses = isAdmin
    ? courses
    : isInstructor
    ? courses // Allow instructors to see all courses reporting
    : courses;

  const relevantCourseIds = relevantCourses.map((c) => c.id);

  // Filter enrollments for relevant courses only
  const relevantEnrollments = enrollments.filter((e) =>
    relevantCourseIds.includes(e.courseId)
  );

  // Calculate stats
  const stats = {
    total: relevantEnrollments.length,
    notStarted: relevantEnrollments.filter((e) => e.status === 'not-started').length,
    inProgress: relevantEnrollments.filter((e) => e.status === 'in-progress').length,
    completed: relevantEnrollments.filter((e) => e.status === 'completed').length,
  };

  // Filter enrollments
  const filteredEnrollments = relevantEnrollments.filter((enrollment) => {
    if (filterStatus === 'all') return true;
    return enrollment.status === filterStatus;
  });

  const getCourse = (courseId) => courses.find((c) => c.id === courseId);
  const getUser = (userId) => users.find((u) => u.id === userId);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reporting</h1>
        <p className="text-gray-600 mt-1">Track learner progress across all courses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition-all hover:shadow-md ${
            filterStatus === 'all' ? 'border-primary-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Participants</p>
        </button>

        <button
          onClick={() => setFilterStatus('not-started')}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition-all hover:shadow-md ${
            filterStatus === 'not-started' ? 'border-primary-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.notStarted}</p>
          <p className="text-sm text-gray-600 mt-1">Yet to Start</p>
        </button>

        <button
          onClick={() => setFilterStatus('in-progress')}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition-all hover:shadow-md ${
            filterStatus === 'in-progress' ? 'border-primary-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          <p className="text-sm text-gray-600 mt-1">In Progress</p>
        </button>

        <button
          onClick={() => setFilterStatus('completed')}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 text-left transition-all hover:shadow-md ${
            filterStatus === 'completed' ? 'border-primary-500' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Learner Progress
          {filterStatus !== 'all' && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Filtered: {filterStatus.replace('-', ' ')})
            </span>
          )}
        </h2>
        <div className="relative">
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            <span>Columns</span>
          </button>
          {showColumnSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
              <h3 className="font-semibold text-gray-900 mb-3">Show Columns</h3>
              <div className="space-y-2">
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={(e) =>
                        setVisibleColumns({
                          ...visibleColumns,
                          [col]: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {col.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sr No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course Name
                </th>
                {visibleColumns.participant && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Participant
                  </th>
                )}
                {visibleColumns.enrolledDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Enrolled Date
                  </th>
                )}
                {visibleColumns.startDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                )}
                {visibleColumns.timeSpent && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Spent
                  </th>
                )}
                {visibleColumns.completion && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completion
                  </th>
                )}
                {visibleColumns.completedDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completed Date
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment, index) => {
                const course = getCourse(enrollment.courseId);
                const user = getUser(enrollment.userId);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {course?.title || 'Unknown Course'}
                    </td>
                    {visibleColumns.participant && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user?.name || 'Unknown User'}
                      </td>
                    )}
                    {visibleColumns.enrolledDate && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(enrollment.enrolledDate)}
                      </td>
                    )}
                    {visibleColumns.startDate && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(enrollment.startDate)}
                      </td>
                    )}
                    {visibleColumns.timeSpent && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {enrollment.timeSpent} min
                      </td>
                    )}
                    {visibleColumns.completion && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.completedDate && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(enrollment.completedDate)}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            enrollment.status
                          )}`}
                        >
                          {enrollment.status.replace('-', ' ')}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No enrollments found for this filter
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingDashboard;
