import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, Trash2, Award, Sparkles, Loader2 } from 'lucide-react';
import { generateQuizFromTranscript } from '../../services/geminiService';

const QuizBuilder = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { getQuizById, updateQuiz, getCourseById } = useApp();

  const quiz = getQuizById(parseInt(quizId));
  const course = getCourseById(parseInt(courseId));
  const [questions, setQuestions] = useState(quiz?.questions || []);
  const [rewards, setRewards] = useState(quiz?.rewards || {
    firstTry: 10,
    secondTry: 7,
    thirdTry: 5,
    fourthTry: 2,
  });
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const currentQuestion = questions[selectedQuestion] || {
    id: Date.now(),
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(questions.length);
  };

  const handleUpdateQuestion = (field, value) => {
    const updated = [...questions];
    updated[selectedQuestion] = {
      ...updated[selectedQuestion],
      [field]: value,
    };
    setQuestions(updated);
  };

  const handleUpdateOption = (index, value) => {
    const updated = [...questions];
    const options = [...updated[selectedQuestion].options];
    options[index] = value;
    updated[selectedQuestion] = {
      ...updated[selectedQuestion],
      options,
    };
    setQuestions(updated);
  };

  const handleAddOption = () => {
    const updated = [...questions];
    updated[selectedQuestion].options.push('');
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Delete this question?')) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      setSelectedQuestion(Math.max(0, index - 1));
    }
  };

  const handleSave = () => {
    updateQuiz(parseInt(quizId), { questions, rewards });
    alert('Quiz saved successfully!');
    navigate(`/admin/courses/${courseId}`);
  };

  const handleGenerateWithAI = async () => {
    if (!transcript.trim()) {
      alert('Please enter a video transcript first!');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedQuestions = await generateQuizFromTranscript(transcript, numberOfQuestions);
      setQuestions(generatedQuestions);
      setShowTranscriptModal(false);
      setSelectedQuestion(0);
      alert(`Successfully generated ${generatedQuestions.length} questions! You can now edit them as needed.`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAIModal = () => {
    // Try to get transcript from course lessons
    const videoLessons = course?.lessons?.filter(l => l.type === 'video' && l.transcript);
    if (videoLessons && videoLessons.length > 0) {
      setTranscript(videoLessons.map(l => l.transcript).join('\n\n'));
    }
    setShowTranscriptModal(true);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin/courses/${courseId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
            <p className="text-gray-600 mt-1">{course?.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAIModal}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Questions List */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Questions</h3>
              <button
                onClick={handleAddQuestion}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedQuestion === index
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Question {index + 1}
                </button>
              ))}
              {questions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No questions yet
                </p>
              )}
            </div>
            <button
              onClick={() => setShowRewards(!showRewards)}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100"
            >
              <Award className="w-5 h-5" />
              <span>Rewards</span>
            </button>
          </div>
        </div>

        {/* Right Panel - Question Editor or Rewards */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!showRewards && questions.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {selectedQuestion + 1}
                  </h3>
                  <button
                    onClick={() => handleDeleteQuestion(selectedQuestion)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={currentQuestion.text}
                      onChange={(e) => handleUpdateQuestion('text', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={currentQuestion.correctAnswer === index}
                            onChange={() => handleUpdateQuestion('correctAnswer', index)}
                            className="w-5 h-5 text-primary-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleUpdateOption(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddOption}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Select the radio button next to the correct answer.
                    </p>
                  </div>
                </div>
              </div>
            ) : showRewards ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Points Rewards
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Set how many points learners earn based on their attempt number
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Attempt
                    </label>
                    <input
                      type="number"
                      value={rewards.firstTry}
                      onChange={(e) =>
                        setRewards({ ...rewards, firstTry: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Second Attempt
                    </label>
                    <input
                      type="number"
                      value={rewards.secondTry}
                      onChange={(e) =>
                        setRewards({ ...rewards, secondTry: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Third Attempt
                    </label>
                    <input
                      type="number"
                      value={rewards.thirdTry}
                      onChange={(e) =>
                        setRewards({ ...rewards, thirdTry: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fourth Attempt and More
                    </label>
                    <input
                      type="number"
                      value={rewards.fourthTry}
                      onChange={(e) =>
                        setRewards({ ...rewards, fourthTry: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Click "Add Question" to create your first question
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Generate Quiz with AI</h2>
                  <p className="text-sm text-gray-600">Powered by Google Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isGenerating}
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 5)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="5"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Transcript *
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  placeholder="Paste your video transcript here...\n\nThe AI will analyze this content and generate relevant quiz questions to test comprehension."
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: The more detailed your transcript, the better the AI-generated questions will be.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>How it works:</span>
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• AI analyzes your transcript to understand key concepts</li>
                  <li>• Generates multiple-choice questions with 4 options each</li>
                  <li>• Questions test comprehension, not just recall</li>
                  <li>• You can edit all generated questions before saving</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !transcript.trim()}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
