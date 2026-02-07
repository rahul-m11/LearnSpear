import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Eye,
  Clock,
  BookOpen,
  Tag,
  CheckCircle,
  MoreVertical,
  Edit,
  Share2,
  Trash2,
} from 'lucide-react';

const CoursesDashboard = () => {
  const { user, courses, createCourse, deleteCourse } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  // Filter courses based on role
  const relevantCourses = isAdmin
    ? courses
    : isInstructor
    ? courses.filter((c) => c.responsibleId === user.id || c.adminId === user.id)
    : courses;

  const filteredCourses = relevantCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = () => {
    if (newCourseName.trim()) {
      const newCourse = createCourse({
        title: newCourseName,
        description: '',
        tags: [],
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
        website: '',
        responsibleId: user.id,
        adminId: user.id,
        published: true,
        visibility: 'everyone',
        access: 'open',
        price: 0,
      });
      setNewCourseName('');
      setShowCreateModal(false);
      navigate(`/admin/courses/${newCourse.id}`);
    }
  };

  const handleShareCourse = (courseId) => {
    const url = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(url);
    alert('Course link copied to clipboard!');
    setActiveMenu(null);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
    setActiveMenu(null);
  };

  const getTotalDuration = (lessons) => {
    return lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600 mt-1">Manage your courses and content</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent input-focus transition-all hover:border-primary-300 hover:shadow-md"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded transition-all duration-300 ${
              view === 'grid'
                ? 'bg-primary-100 text-primary-700 scale-110'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded transition-all duration-300 ${
              view === 'list'
                ? 'bg-primary-100 text-primary-700 scale-110'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Create Course Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 btn-ripple btn-press hover-glow transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover-lift card-shine group animate-fade-in-up"
              style={{ animationDelay: `${0.05 * (index + 1)}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {course.published && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full animate-bounce-in">
                    Published
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full flex items-center hover:bg-primary-100 transition-colors transform hover:scale-105"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>{course.views}</span>
                  </div>
                  <div className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                    <Clock className="w-4 h-4" />
                    <span>{getTotalDuration(course.lessons)} min</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 btn-ripple btn-press transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === course.id ? null : course.id)
                      }
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenu === course.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-scale-in dropdown-enter">
                        <button
                          onClick={() => handleShareCourse(course.id)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors hover:translate-x-1"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Link</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lessons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map((course, index) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors list-item-slide" style={{ animationDelay: `${0.05 * index}s` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover hover:scale-110 transition-transform"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">ID: {course.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {course.lessons.length}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getTotalDuration(course.lessons)} min
                  </td>
                  <td className="px-6 py-4">
                    {course.published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareCourse(course.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 animate-bounce-in" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try a different search query' : 'Get started by creating a new course'}
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay-enter">
          <div className="bg-white rounded-xl p-6 w-full max-w-md modal-enter">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Course</h2>
            <input
              type="text"
              placeholder="Course name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCourse()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent input-focus mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all btn-press"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={!newCourseName.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all btn-press hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesDashboard;
