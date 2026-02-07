import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Save,
  Eye,
  Users,
  Mail,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  UserPlus,
  Send,
  X,
  Link,
} from 'lucide-react';

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    user,
    getCourseById, 
    updateCourse, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    users, 
    quizzes,
    createQuiz,
    addAttendee,
    removeAttendee,
    sendAttendeeMessage,
  } = useApp();

  const course = getCourseById(parseInt(courseId));
  
  // Check if user has permission to edit this course
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const hasPermission = isAdmin || (isInstructor && (course?.responsibleId === user.id || course?.adminId === user.id));
  
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState(course || {});
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonTab, setLessonTab] = useState('content');

  // Add Attendees modal state
  const [showAddAttendeesModal, setShowAddAttendeesModal] = useState(false);
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeEmails, setAttendeeEmails] = useState([]);

  // Contact Attendees modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    description: '',
    url: '',
    duration: 0,
    allowDownload: false,
    responsibleId: null,
    attachments: [],
    moduleNumber: 1,
    videoFile: null,
    transcript: '',
  });

  // Attachment form state
  const [newAttachment, setNewAttachment] = useState({ type: 'link', name: '', url: '' });

  if (!course || !hasPermission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-900 font-semibold mb-2">
          {!course ? 'Course not found' : 'You do not have permission to edit this course'}
        </p>
        <button 
          onClick={() => navigate('/admin/courses')} 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  const handleSaveCourse = () => {
    updateCourse(parseInt(courseId), formData);
    alert('Course updated successfully!');
    navigate('/admin/courses');
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      type: 'video',
      description: '',
      url: '',
      duration: 0,
      allowDownload: false,
      responsibleId: null,
      attachments: [],
      moduleNumber: (course.lessons.length || 0) + 1,
      videoFile: null,
      transcript: '',
    });
    setLessonTab('content');
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm(lesson);
    setLessonTab('content');
    setShowLessonModal(true);
  };

  const handleSaveLesson = () => {
    if (editingLesson) {
      updateLesson(parseInt(courseId), editingLesson.id, lessonForm);
    } else {
      addLesson(parseInt(courseId), lessonForm);
    }
    setShowLessonModal(false);
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLesson(parseInt(courseId), lessonId);
    }
  };

  // Add Quiz function
  const handleAddQuiz = () => {
    const newQuiz = createQuiz({
      courseId: parseInt(courseId),
      title: `Quiz for ${course.title}`,
    });
    navigate(`/admin/courses/${courseId}/quiz/${newQuiz.id}`);
  };

  // Add Attendees functions
  const handleAddEmailToList = () => {
    if (attendeeEmail && !attendeeEmails.includes(attendeeEmail)) {
      setAttendeeEmails([...attendeeEmails, attendeeEmail]);
      setAttendeeEmail('');
    }
  };

  const handleRemoveEmailFromList = (email) => {
    setAttendeeEmails(attendeeEmails.filter((e) => e !== email));
  };

  const handleInviteAttendees = () => {
    attendeeEmails.forEach((email) => {
      addAttendee(parseInt(courseId), email);
    });
    setAttendeeEmails([]);
    setShowAddAttendeesModal(false);
    alert(`${attendeeEmails.length || 'All'} attendees invited successfully!`);
  };

  // Contact Attendees function
  const handleSendMessage = () => {
    if (contactSubject && contactMessage) {
      sendAttendeeMessage(parseInt(courseId), contactSubject, contactMessage);
      setContactSubject('');
      setContactMessage('');
      setShowContactModal(false);
      alert('Message sent to all attendees!');
    }
  };

  // Attachment functions
  const handleAddAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      setLessonForm({
        ...lessonForm,
        attachments: [...(lessonForm.attachments || []), { ...newAttachment }],
      });
      setNewAttachment({ type: 'link', name: '', url: '' });
    }
  };

  const handleRemoveAttachment = (index) => {
    setLessonForm({
      ...lessonForm,
      attachments: lessonForm.attachments.filter((_, i) => i !== index),
    });
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Courses</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-1">Edit course details</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddAttendeesModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Attendees</span>
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Attendees</span>
            </button>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Publish</span>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-primary-600 relative cursor-pointer transition-colors"
              />
            </label>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleSaveCourse}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags?.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map((t) => t.trim()),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="React, JavaScript, Frontend"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['content', 'description', 'options', 'quiz'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
                <button
                  onClick={handleAddLesson}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Content</span>
                </button>
              </div>
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-500 capitalize">{lesson.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {course.lessons.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No lessons yet. Click "Add Content" to create your first lesson.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter a detailed description of your course..."
              />
            </div>
          )}

          {/* Options Tab */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Admin
                </label>
                <select
                  value={formData.adminId || ''}
                  onChange={(e) => setFormData({ ...formData, adminId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Admin</option>
                  {users
                    .filter((u) => u.role === 'admin' || u.role === 'instructor')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility (Show course to)
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="everyone">Everyone</option>
                  <option value="signed-in">Signed In Users Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Rule</label>
                <select
                  value={formData.access}
                  onChange={(e) => setFormData({ ...formData, access: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="invitation">On Invitation</option>
                  <option value="payment">On Payment</option>
                </select>
              </div>
              {formData.access === 'payment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quizzes</h3>
                <button
                  onClick={handleAddQuiz}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Quiz</span>
                </button>
              </div>
              <div className="space-y-3">
                {quizzes
                  .filter((q) => q.courseId === parseInt(courseId))
                  .map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">
                          {quiz.questions.length} questions
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/courses/${courseId}/quiz/${quiz.id}`)}
                        className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
                      >
                        Edit Quiz
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h2>
            </div>
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['content', 'description', 'attachments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLessonTab(tab)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      lessonTab === tab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6">
              {lessonTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Number *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={lessonForm.moduleNumber}
                        onChange={(e) => setLessonForm({ ...lessonForm, moduleNumber: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={lessonForm.type}
                      onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  {lessonForm.type === 'video' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Method
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button
                            type="button"
                            onClick={() => setLessonForm({ ...lessonForm, videoFile: null })}
                            className={`px-4 py-2 border-2 rounded-lg transition-all ${
                              !lessonForm.videoFile
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Video URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setLessonForm({ ...lessonForm, videoFile: 'placeholder' })}
                            className={`px-4 py-2 border-2 rounded-lg transition-all ${
                              lessonForm.videoFile
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Upload File
                          </button>
                        </div>
                      </div>
                      {!lessonForm.videoFile ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                          </label>
                          <input
                            type="url"
                            value={lessonForm.url}
                            onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="https://youtube.com/watch?v=... or upload file"
                          />
                          <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video File
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">MP4, WebM, or AVI (max 500MB)</p>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              id="video-upload"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setLessonForm({ ...lessonForm, url: URL.createObjectURL(file) });
                                  alert(`File "${file.name}" ready for upload. In production, this would upload to your server.`);
                                }
                              }}
                            />
                            <label
                              htmlFor="video-upload"
                              className="mt-3 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
                            >
                              Choose File
                            </label>
                            {lessonForm.url && (
                              <p className="text-xs text-green-600 mt-2">✓ File selected</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={lessonForm.duration}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Transcript (Optional)
                        </label>
                        <textarea
                          value={lessonForm.transcript}
                          onChange={(e) => setLessonForm({ ...lessonForm, transcript: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows={4}
                          placeholder="Paste or type video transcript for AI quiz generation..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Used to generate skip-unlock quiz questions</p>
                      </div>
                    </>
                  )}
                  {lessonForm.type === 'document' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document URL
                        </label>
                        <input
                          type="url"
                          value={lessonForm.url}
                          onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={lessonForm.allowDownload}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, allowDownload: e.target.checked })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Allow Download</span>
                      </label>
                    </>
                  )}
                  {lessonForm.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={lessonForm.url}
                        onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
              {lessonTab === 'description' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, description: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              {lessonTab === 'attachments' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Add additional resources for this lesson
                  </p>
                  
                  {/* Add new attachment form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newAttachment.type}
                          onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="link">Link</option>
                          <option value="file">File URL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={newAttachment.name}
                          onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                          placeholder="Resource name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                        <input
                          type="url"
                          value={newAttachment.url}
                          onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddAttachment}
                      disabled={!newAttachment.name || !newAttachment.url}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Attachment</span>
                    </button>
                  </div>

                  {/* Attachments list */}
                  {lessonForm.attachments && lessonForm.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {lessonForm.attachments.map((att, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {att.type === 'link' ? (
                              <Link className="w-5 h-5 text-primary-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-primary-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{att.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{att.url}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAttachment(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No attachments yet</p>
                  )}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
              <button
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendees Modal */}
      {showAddAttendeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Attendees</h2>
              <button
                onClick={() => setShowAddAttendeesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Invite learners by email address. They will receive an invitation to join this course.
              </p>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmailToList()}
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddEmailToList}
                  disabled={!attendeeEmail}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* Email list */}
              {attendeeEmails.length > 0 && (
                <div className="mb-4 max-h-40 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Emails to invite ({attendeeEmails.length}):
                  </p>
                  <div className="space-y-2">
                    {attendeeEmails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          onClick={() => handleRemoveEmailFromList(email)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current attendees */}
              {course.attendees && course.attendees.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Current attendees ({course.attendees.length}):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {course.attendees.map((att, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{att.email}</span>
                        <button
                          onClick={() => removeAttendee(parseInt(courseId), att.email)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setShowAddAttendeesModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteAttendees}
                disabled={attendeeEmails.length === 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invite {attendeeEmails.length > 0 ? `(${attendeeEmails.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Attendees Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Contact Attendees</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Send a message to all attendees enrolled in this course.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Message subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                This message will be sent to {course.attendees?.length || 0} attendee(s).
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!contactSubject || !contactMessage}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForm;
