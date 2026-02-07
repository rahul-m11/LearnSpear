import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Circle,
  Search,
  Star,
  User,
  BookOpen,
  Clock,
  Users,
  Award,
  Trophy,
  Zap,
  Target,
  Heart,
  Share2,
  Download,
  Lock,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  ThumbsUp,
  BarChart2,
  Video,
  FileText,
  HelpCircle,
  Loader
} from 'lucide-react';
import { generateCertificate } from '../../services/geminiService';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    user,
    getCourseById,
    getEnrollment,
    getCourseReviews,
    addReview,
    users,
    enrollCourse,
  } = useApp();

  const course = getCourseById(parseInt(courseId));
  const enrollment = user ? getEnrollment(user.id, parseInt(courseId)) : null;
  const reviews = getCourseReviews(parseInt(courseId));

  const [activeTab, setActiveTab] = useState('overview');
  const [searchLesson, setSearchLesson] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, review: '' });
  const [isLiked, setIsLiked] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!user || !course) return;
    setGeneratingCertificate(true);
    try {
      // Format date nicely
      const dateObj = enrollment?.completedDate ? new Date(enrollment.completedDate) : new Date();
      const completionDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const svgContent = await generateCertificate(user.name, course.title, completionDate);
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${course.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate certificate", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setGeneratingCertificate(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500 mb-6">The course you're looking for doesn't exist.</p>
        <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  if (!user && course.visibility === 'signed-in') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-6">Please login to view this course content.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const filteredLessons = course.lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchLesson.toLowerCase())
  );

  const completedCount = enrollment?.completedLessons.length || 0;
  const totalLessons = course.lessons.length;
  const incompleteCount = totalLessons - completedCount;
  const totalDuration = course.lessons.reduce((acc, l) => acc + (l.duration || 10), 0);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 4.8;

  const handleStartLesson = (lessonId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!enrollment) {
      enrollCourse(user.id, parseInt(courseId));
    }
    navigate(`/learn/${courseId}/${lessonId}`);
  };

  const handleAddReview = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addReview({
      courseId: parseInt(courseId),
      userId: user.id,
      ...newReview,
    });
    setShowReviewModal(false);
    setNewReview({ rating: 5, review: '' });
  };

  const getUserById = (userId) => users.find((u) => u.id === userId);

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'quiz': return <HelpCircle className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 via-sky-500/20 to-slate-500/20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Courses</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-white/80 mb-6 max-w-2xl">
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= avgRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{avgRating}</span>
                  <span className="text-white/60">({reviews.length + 42} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span>1,234 enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-5 h-5" />
                  <span>{Math.ceil(totalDuration / 60)}h total</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleStartLesson(course.lessons[0].id)}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-semibold rounded-2xl hover:shadow-xl hover:shadow-cyan-400/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <Play className="w-6 h-6" />
                  <span>{enrollment ? 'Continue Learning' : 'Start Course'}</span>
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isLiked 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-4 bg-white/5 border-2 border-white/20 text-white/70 rounded-2xl hover:bg-white/10 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform lg:-translate-y-4">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                    <button 
                      onClick={() => handleStartLesson(course.lessons[0].id)}
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {enrollment && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Your Progress</span>
                        <span className="font-bold text-blue-600">{enrollment.progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-500 progress-animated"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {completedCount} of {totalLessons} lessons completed
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{totalLessons} Lessons</p>
                        <p className="text-sm">Comprehensive content</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{Math.ceil(totalDuration / 60)} Hours</p>
                        <p className="text-sm">Total duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Certificate</p>
                        {enrollment?.progress === 100 && (course.certificateEnabled !== false) ? (
                          <div className="mt-1">
                            <button 
                              onClick={handleDownloadCertificate}
                              disabled={generatingCertificate}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                            >
                              {generatingCertificate ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                              {generatingCertificate ? 'Generating...' : 'Download Certificate'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm">Upon completion</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Lifetime Access</p>
                        <p className="text-sm">Learn at your pace</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-100 px-6">
            <nav className="flex gap-8">
              {[
                { id: 'overview', label: 'Course Content', icon: BookOpen },
                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Search Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                    <p className="text-gray-500 mt-1">
                      {totalLessons} lessons • {Math.ceil(totalDuration / 60)} hours total length
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchLesson}
                      onChange={(e) => setSearchLesson(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-64"
                    />
                  </div>
                </div>

                {/* Lessons List */}
                <div className="space-y-3">
                  {filteredLessons.map((lesson, index) => {
                    const isCompleted = enrollment?.completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          isCompleted
                            ? 'bg-green-50/50 border-green-200 hover:border-green-300'
                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                        }`}
                        onClick={() => handleStartLesson(lesson.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-500 group-hover:text-white'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              getLessonIcon(lesson.type)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-400">Lesson {index + 1}</span>
                              {isCompleted && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="capitalize flex items-center gap-1">
                                {getLessonIcon(lesson.type)}
                                {lesson.type}
                              </span>
                              {lesson.duration && (
                                <>
                                  <span>•</span>
                                  <span>{lesson.duration} min</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-medium transition-all ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-600 text-white group-hover:bg-blue-700'
                        }`}>
                          <Play className="w-4 h-4" />
                          <span>{isCompleted ? 'Review' : 'Start'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredLessons.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No lessons found matching "{searchLesson}"</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Reviews Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">{avgRating}</span>
                        <div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= avgRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">{reviews.length + 42} reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {user && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Write a Review</span>
                    </button>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewer = getUserById(review.userId);
                    return (
                      <div
                        key={review.id}
                        className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={reviewer?.avatar}
                            alt={reviewer?.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{reviewer?.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.review}</p>
                            <div className="flex items-center gap-4 mt-4">
                              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {reviews.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Experience</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none transform hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={newReview.review}
                onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                placeholder="Tell others what you thought about this course..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReview}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
