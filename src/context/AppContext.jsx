import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock initial data

// Curated high-quality avatar collection
export const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Nolan&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Sophia&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Liam&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Chloe&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Oliver&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Amaya&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Riley&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Jasper&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Luna&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Mia&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Zara&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Kai&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Iris&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Eden&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Rowan&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Aiden&backgroundColor=d1d4f9',
];

const getRandomAvatar = () => AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

const initialUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@admin.in',
    password: 'Learn@123',
    role: 'admin',
    avatar: AVATAR_OPTIONS[0],
    points: 0,
  },
  {
    id: 2,
    name: 'John Instructor',
    email: 'john@ac.in',
    password: 'Learn@123',
    role: 'instructor',
    avatar: AVATAR_OPTIONS[3],
    points: 0,
  },
  {
    id: 3,
    name: 'Jane Learner',
    email: 'jane@gmail.com',
    password: 'Learn@123',
    role: 'learner',
    avatar: AVATAR_OPTIONS[2],
    points: 65,
  },
  // Additional users for demo enrollments
  { id: 4, name: 'Mike Student', email: 'mike@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[5], points: 30 },
  { id: 5, name: 'Sarah Student', email: 'sarah@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[4], points: 25 },
  { id: 6, name: 'Tom Student', email: 'tom@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[9], points: 45 },
  { id: 7, name: 'Lisa Student', email: 'lisa@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[10], points: 20 },
  { id: 8, name: 'David Student', email: 'david@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[13], points: 15 },
  { id: 9, name: 'Emma Student', email: 'emma@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[12], points: 10 },
  { id: 10, name: 'Arjun Sharma', email: 'arjun@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[6], points: 120 },
  { id: 11, name: 'Priya Patel', email: 'priya@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[7], points: 95 },
  { id: 12, name: 'Ravi Kumar', email: 'ravi@gmail.com', password: 'Learn@123', role: 'learner', avatar: AVATAR_OPTIONS[8], points: 80 },
];

const initialCourses = [
  {
    id: 1,
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React and build modern web applications',
    tags: ['React', 'JavaScript', 'Frontend'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    website: 'https://learnsphere.com/courses/react',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 1250,
    createdAt: '2026-01-15T10:00:00Z',
    attendees: [{ email: 'learner@learnsphere.com', invitedDate: '2026-01-20T10:00:00Z' }],
    lessons: [
      {
        id: 1,
        title: 'What is React?',
        type: 'video',
        description: 'An introduction to React and its core concepts',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 15,
        responsibleId: 2,
        attachments: [
          { type: 'file', name: 'React Basics.pdf', url: '#' },
          { type: 'link', name: 'Official Docs', url: 'https://react.dev' },
        ],
      },
      {
        id: 2,
        title: 'Setting Up Your Environment',
        type: 'document',
        description: 'Learn how to set up your development environment for React',
        url: '/docs/setup.pdf',
        allowDownload: true,
        attachments: [],
      },
      {
        id: 3,
        title: 'React Components Quiz',
        type: 'quiz',
        description: 'Test your knowledge about React components',
        quizId: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts and patterns including closures, prototypes, and async programming',
    tags: ['JavaScript', 'Programming', 'Advanced'],
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 850,
    createdAt: '2026-01-20T14:30:00Z',
    lessons: [
      {
        id: 5,
        title: 'Understanding Closures',
        type: 'video',
        description: 'Deep dive into JavaScript closures',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 25,
        attachments: [],
      },
      {
        id: 6,
        title: 'Async/Await Patterns',
        type: 'video',
        description: 'Modern asynchronous JavaScript patterns',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 30,
        attachments: [],
      },
    ],
    attendees: [],
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass',
    description: 'Complete guide to modern UI/UX design principles and create stunning user interfaces',
    tags: ['Design', 'UI/UX', 'Creative'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    website: 'https://learnsphere.com/courses/design',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 2100,
    createdAt: '2026-01-10T09:15:00Z',
    attendees: [],
    lessons: [
      {
        id: 4,
        title: 'Design Principles',
        type: 'video',
        description: 'Core principles of good design',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 20,
        attachments: [],
      },
    ],
  },
  {
    id: 4,
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, visualization, and machine learning fundamentals',
    tags: ['Python', 'Data Science', 'ML'],
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 3200,
    createdAt: '2026-01-05T08:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 7,
        title: 'Python Basics',
        type: 'video',
        description: 'Introduction to Python programming',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 20,
        attachments: [],
      },
      {
        id: 8,
        title: 'NumPy & Pandas',
        type: 'video',
        description: 'Data manipulation with NumPy and Pandas',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 35,
        attachments: [],
      },
      {
        id: 9,
        title: 'Data Visualization',
        type: 'video',
        description: 'Creating charts with Matplotlib and Seaborn',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 25,
        attachments: [],
      },
    ],
  },
  {
    id: 5,
    title: 'Full-Stack Web Development',
    description: 'Build complete web applications from frontend to backend with Node.js, Express, and MongoDB',
    tags: ['Full-Stack', 'Node.js', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 1850,
    createdAt: '2026-01-12T11:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 10,
        title: 'Backend Fundamentals',
        type: 'video',
        description: 'Introduction to server-side development',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 30,
        attachments: [],
      },
      {
        id: 11,
        title: 'REST API Design',
        type: 'video',
        description: 'Building RESTful APIs with Express',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 40,
        attachments: [],
      },
    ],
  },
  {
    id: 6,
    title: 'Mobile App Development with React Native',
    description: 'Create cross-platform mobile apps for iOS and Android using React Native',
    tags: ['React Native', 'Mobile', 'iOS', 'Android'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 2,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 980,
    createdAt: '2026-01-18T09:30:00Z',
    attendees: [],
    lessons: [
      {
        id: 12,
        title: 'React Native Setup',
        type: 'video',
        description: 'Setting up your React Native development environment',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 15,
        attachments: [],
      },
      {
        id: 13,
        title: 'Building Your First App',
        type: 'video',
        description: 'Create a simple mobile application',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 45,
        attachments: [],
      },
    ],
  },
  {
    id: 7,
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services and deploy scalable cloud applications',
    tags: ['AWS', 'Cloud', 'DevOps'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'everyone',
    access: 'payment',
    price: 1,
    views: 1450,
    createdAt: '2026-01-08T14:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 14,
        title: 'AWS Overview',
        type: 'video',
        description: 'Introduction to AWS services',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 20,
        attachments: [],
      },
      {
        id: 15,
        title: 'EC2 & S3',
        type: 'video',
        description: 'Working with EC2 instances and S3 storage',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 35,
        attachments: [],
      },
    ],
  },
  {
    id: 8,
    title: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts, ethical hacking, and how to protect systems',
    tags: ['Security', 'Hacking', 'Networks'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    website: '',
    responsibleId: 2,
    adminId: 1,
    published: true,
    visibility: 'signed-in',
    access: 'invitation',
    price: 0,
    views: 720,
    createdAt: '2026-01-22T10:00:00Z',
    attendees: [],
    lessons: [
      {
        id: 16,
        title: 'Security Basics',
        type: 'video',
        description: 'Introduction to cybersecurity',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 25,
        attachments: [],
      },
    ],
  },
];

const initialQuizzes = [
  {
    id: 1,
    courseId: 1,
    title: 'React Components Quiz',
    questions: [
      {
        id: 1,
        text: 'What is a React component?',
        options: [
          'A reusable piece of UI',
          'A JavaScript function',
          'A class or function that returns JSX',
          'All of the above',
        ],
        correctAnswer: 3,
      },
      {
        id: 2,
        text: 'Which hook is used for side effects?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
      },
    ],
    rewards: {
      firstTry: 10,
      secondTry: 7,
      thirdTry: 5,
      fourthTry: 2,
    },
  },
];

const initialEnrollments = [
  // Learner (id: 3) enrollments
  {
    userId: 3,
    courseId: 1,
    enrolledDate: '2026-02-01T08:00:00Z',
    startDate: '2026-02-01T09:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 66,
    timeSpent: 45,
    completedLessons: [1, 2],
  },
  {
    userId: 3,
    courseId: 2,
    enrolledDate: '2026-01-28T10:00:00Z',
    startDate: '2026-01-28T11:00:00Z',
    completedDate: '2026-02-03T15:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 90,
    completedLessons: [5, 6],
  },
  {
    userId: 3,
    courseId: 4,
    enrolledDate: '2026-02-05T09:00:00Z',
    startDate: '2026-02-05T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 33,
    timeSpent: 25,
    completedLessons: [7],
  },
  // Additional users for Admin/Instructor stats
  {
    userId: 4,
    courseId: 3,
    enrolledDate: '2026-01-15T08:00:00Z',
    startDate: '2026-01-15T09:00:00Z',
    completedDate: '2026-01-25T14:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 60,
    completedLessons: [4],
  },
  {
    userId: 5,
    courseId: 3,
    enrolledDate: '2026-01-20T10:00:00Z',
    startDate: '2026-01-20T11:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 50,
    timeSpent: 30,
    completedLessons: [],
  },
  {
    userId: 6,
    courseId: 5,
    enrolledDate: '2026-01-22T08:00:00Z',
    startDate: '2026-01-22T09:00:00Z',
    completedDate: '2026-02-01T16:00:00Z',
    status: 'completed',
    progress: 100,
    timeSpent: 120,
    completedLessons: [10, 11],
  },
  {
    userId: 7,
    courseId: 5,
    enrolledDate: '2026-01-25T14:00:00Z',
    startDate: '2026-01-25T15:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 45,
    timeSpent: 50,
    completedLessons: [10],
  },
  {
    userId: 8,
    courseId: 5,
    enrolledDate: '2026-02-01T09:00:00Z',
    startDate: '2026-02-01T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 20,
    timeSpent: 15,
    completedLessons: [],
  },
  {
    userId: 4,
    courseId: 6,
    enrolledDate: '2026-01-28T10:00:00Z',
    startDate: '2026-01-28T11:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 75,
    timeSpent: 80,
    completedLessons: [12],
  },
  {
    userId: 9,
    courseId: 6,
    enrolledDate: '2026-02-03T08:00:00Z',
    startDate: '2026-02-03T09:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 30,
    timeSpent: 20,
    completedLessons: [],
  },
  {
    userId: 5,
    courseId: 1,
    enrolledDate: '2026-02-02T11:00:00Z',
    startDate: '2026-02-02T12:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 33,
    timeSpent: 20,
    completedLessons: [1],
  },
  {
    userId: 6,
    courseId: 4,
    enrolledDate: '2026-01-30T09:00:00Z',
    startDate: '2026-01-30T10:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 66,
    timeSpent: 55,
    completedLessons: [7, 8],
  },
  {
    userId: 7,
    courseId: 7,
    enrolledDate: '2026-02-04T14:00:00Z',
    startDate: '2026-02-04T15:00:00Z',
    completedDate: null,
    status: 'in-progress',
    progress: 25,
    timeSpent: 10,
    completedLessons: [],
  },
];

const initialReviews = [
  {
    id: 1,
    courseId: 1,
    userId: 3,
    rating: 5,
    review: 'Excellent course! Very clear explanations and great examples.',
    date: '2026-02-05T10:30:00Z',
  },
];

// Badge levels - icon names reference Lucide icons
export const BADGE_LEVELS = [
  { name: 'Newbie', points: 0, color: 'text-gray-400', icon: 'Sprout' },
  { name: 'Explorer', points: 20, color: 'text-green-500', icon: 'Search' },
  { name: 'Achiever', points: 40, color: 'text-blue-500', icon: 'Star' },
  { name: 'Specialist', points: 60, color: 'text-purple-500', icon: 'Gem' },
  { name: 'Expert', points: 80, color: 'text-orange-500', icon: 'Trophy' },
  { name: 'Master', points: 100, color: 'text-red-500', icon: 'Crown' },
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [courses, setCourses] = useState(initialCourses);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [reviews, setReviews] = useState(initialReviews);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [likedCourses, setLikedCourses] = useState([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);
  const [payments, setPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('learnspear_payments');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist payments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('learnspear_payments', JSON.stringify(payments));
  }, [payments]);

  const getLocalDateKey = (date = new Date()) => {
    // YYYY-MM-DD in user's local timezone
    return date.toLocaleDateString('en-CA');
  };

  const getActivityStorageKey = (userId) => `activityCounts:${userId}`;

  const readActivityCounts = (userId) => {
    try {
      const raw = localStorage.getItem(getActivityStorageKey(userId));
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  const writeActivityCounts = (userId, counts) => {
    localStorage.setItem(getActivityStorageKey(userId), JSON.stringify(counts));
  };

  const touchDailyActivity = (userId, dateKey = getLocalDateKey()) => {
    if (!userId) return;
    const counts = readActivityCounts(userId);
    counts[dateKey] = Math.max(counts[dateKey] || 0, 1);
    writeActivityCounts(userId, counts);
  };

  const incrementDailyActivity = (userId, amount = 1, dateKey = getLocalDateKey()) => {
    if (!userId) return;
    const counts = readActivityCounts(userId);
    counts[dateKey] = (counts[dateKey] || 0) + amount;
    writeActivityCounts(userId, counts);
  };

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Mark today as active when the user is present (return visit / persisted session)
      touchDailyActivity(parsed?.id);
    }
  }, []);

  // Auth functions
  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      const nowIso = new Date().toISOString();
      const nextUser = { ...userWithoutPassword, lastLoginAt: nowIso };
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      touchDailyActivity(nextUser.id);
      return true;
    }
    return false;
  };

  const register = (userData) => {
    const newUser = {
      ...userData,
      id: users.length + 1,
      avatar: getRandomAvatar(),
      points: 0,
    };
    setUsers([...users, newUser]);
    const { password, ...userWithoutPassword } = newUser;
    const nowIso = new Date().toISOString();
    const nextUser = { ...userWithoutPassword, lastLoginAt: nowIso };
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
    touchDailyActivity(nextUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Course functions
  const createCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: courses.length + 1,
      lessons: [],
      views: 0,
      createdAt: new Date().toISOString(),
    };
    setCourses([...courses, newCourse]);
    return newCourse;
  };

  const updateCourse = (courseId, updates) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      )
    );
  };

  const deleteCourse = (courseId) => {
    setCourses(courses.filter((course) => course.id !== courseId));
  };

  const getCourseById = (courseId) => {
    return courses.find((course) => course.id === parseInt(courseId));
  };

  // Lesson functions
  const addLesson = (courseId, lessonData) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newLesson = {
      ...lessonData,
      id: Date.now(),
    };

    updateCourse(courseId, {
      lessons: [...course.lessons, newLesson],
    });
  };

  const updateLesson = (courseId, lessonId, updates) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    updateCourse(courseId, {
      lessons: course.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      ),
    });
  };

  const deleteLesson = (courseId, lessonId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    updateCourse(courseId, {
      lessons: course.lessons.filter((lesson) => lesson.id !== lessonId),
    });
  };

  // Quiz functions
  const createQuiz = (quizData) => {
    const newQuiz = {
      ...quizData,
      id: quizzes.length + 1,
      questions: [],
      rewards: {
        firstTry: 10,
        secondTry: 7,
        thirdTry: 5,
        fourthTry: 2,
      },
    };
    setQuizzes([...quizzes, newQuiz]);
    return newQuiz;
  };

  const updateQuiz = (quizId, updates) => {
    setQuizzes(
      quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, ...updates } : quiz))
    );
  };

  const deleteQuiz = (quizId) => {
    setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
  };

  const getQuizById = (quizId) => {
    return quizzes.find((quiz) => quiz.id === parseInt(quizId));
  };

  // Enrollment functions
  const enrollCourse = (userId, courseId) => {
    const existing = enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
    if (existing) return false;

    const newEnrollment = {
      userId,
      courseId,
      enrolledDate: new Date().toISOString(),
      startDate: null,
      completedDate: null,
      status: 'not-started',
      progress: 0,
      timeSpent: 0,
      completedLessons: [],
    };
    setEnrollments([...enrollments, newEnrollment]);
    return true;
  };

  const updateEnrollment = (userId, courseId, updates) => {
    setEnrollments(
      enrollments.map((enrollment) =>
        enrollment.userId === userId && enrollment.courseId === courseId
          ? { ...enrollment, ...updates }
          : enrollment
      )
    );
  };

  const getEnrollment = (userId, courseId) => {
    return enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
  };

  const addPoints = (userId, points) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: (u.points || 0) + points } : u));
    // Also update session user if it's the current user
    setUser(prev => {
      if (prev && prev.id === userId) {
        const updated = { ...prev, points: (prev.points || 0) + points };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const completeLesson = (userId, courseId, lessonId) => {
    const enrollment = getEnrollment(userId, courseId);
    if (!enrollment) return;

    const course = getCourseById(courseId);
    if (!course) return;

    const completedLessons = [...enrollment.completedLessons];
    const alreadyDone = completedLessons.includes(lessonId);
    if (!alreadyDone) {
      completedLessons.push(lessonId);
    }

    const progress = Math.round(
      (completedLessons.length / course.lessons.length) * 100
    );
    const status =
      progress === 100
        ? 'completed'
        : enrollment.startDate
        ? 'in-progress'
        : 'not-started';

    updateEnrollment(userId, courseId, {
      completedLessons,
      progress,
      status,
      startDate: enrollment.startDate || new Date().toISOString(),
    });

    // Award 10 XP per new lesson completed
    if (!alreadyDone) {
      addPoints(userId, 10);
    }

    // Award 50 XP bonus when course is fully completed
    if (progress === 100 && enrollment.progress < 100) {
      addPoints(userId, 50);
    }

    incrementDailyActivity(userId, 1);
  };

  const completeCourse = (userId, courseId) => {
    const enrollment = getEnrollment(userId, courseId);
    const wasAlreadyComplete = enrollment?.progress === 100;

    updateEnrollment(userId, courseId, {
      completedDate: new Date().toISOString(),
      status: 'completed',
      progress: 100,
    });

    // Award 50 XP if not already completed
    if (!wasAlreadyComplete) {
      addPoints(userId, 50);
    }

    incrementDailyActivity(userId, 1);
  };

  // Quiz attempt functions
  const recordQuizAttempt = (userId, quizId, score, attemptNumber) => {
    const key = `${userId}-${quizId}`;
    const attempts = quizAttempts[key] || [];
    attempts.push({
      score,
      attemptNumber,
      date: new Date().toISOString(),
    });
    setQuizAttempts({ ...quizAttempts, [key]: attempts });

    // Award XP based on quiz score (first attempt only)
    if (attemptNumber === 1) {
      const xp = score >= 90 ? 25 : score >= 70 ? 15 : score >= 50 ? 10 : 5;
      addPoints(userId, xp);
    }

    incrementDailyActivity(userId, 1);
  };

  const getQuizAttempts = (userId, quizId) => {
    const key = `${userId}-${quizId}`;
    return quizAttempts[key] || [];
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUsers(users.map((u) => (u.id === user.id ? { ...u, ...updates } : u)));
  };

  const getUserBadge = (points) => {
    const sorted = [...BADGE_LEVELS].sort((a, b) => b.points - a.points);
    return sorted.find((badge) => points >= badge.points) || BADGE_LEVELS[0];
  };

  // Review functions
  const addReview = (reviewData) => {
    const newReview = {
      ...reviewData,
      id: reviews.length + 1,
      date: new Date().toISOString(),
    };
    setReviews([...reviews, newReview]);
  };

  const getCourseReviews = (courseId) => {
    return reviews.filter((r) => r.courseId === courseId);
  };

  // Attendee functions
  const addAttendee = (courseId, email) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;
    
    const attendees = course.attendees || [];
    if (attendees.some((a) => a.email === email)) return false;
    
    updateCourse(courseId, {
      attendees: [...attendees, { email, invitedDate: new Date().toISOString() }],
    });
    return true;
  };

  const removeAttendee = (courseId, email) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    
    updateCourse(courseId, {
      attendees: (course.attendees || []).filter((a) => a.email !== email),
    });
  };

  const getCourseAttendees = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.attendees || [];
  };

  const sendAttendeeMessage = (courseId, subject, message) => {
    // Simulated email send - in production this would call an API
    console.log(`Sending message to attendees of course ${courseId}:`, { subject, message });
    return true;
  };

  // Like/Bookmark functions
  const toggleLikeCourse = (courseId) => {
    if (likedCourses.includes(courseId)) {
      setLikedCourses(likedCourses.filter((id) => id !== courseId));
    } else {
      setLikedCourses([...likedCourses, courseId]);
    }
  };

  const toggleBookmarkCourse = (courseId) => {
    if (bookmarkedCourses.includes(courseId)) {
      setBookmarkedCourses(bookmarkedCourses.filter((id) => id !== courseId));
    } else {
      setBookmarkedCourses([...bookmarkedCourses, courseId]);
    }
  };

  const removeCourse = (courseId) => {
    setCourses(courses.filter((course) => course.id !== courseId));
    setLikedCourses(likedCourses.filter((id) => id !== courseId));
    setBookmarkedCourses(bookmarkedCourses.filter((id) => id !== courseId));
  };

  const getBookmarkedCourses = () => {
    return courses.filter((course) => bookmarkedCourses.includes(course.id));
  };

  // Payment functions
  const addPayment = (payment) => {
    setPayments(prev => [...prev, payment]);
  };

  const getPaymentHistory = (userId) => {
    return payments.filter(p => p.userId === userId);
  };

  const hasPurchased = (userId, courseId) => {
    return payments.some(p => p.userId === userId && p.courseId === courseId && p.status === 'completed');
  };

  // Check if user has a pending payment for a course
  const getPendingPayment = (userId, courseId) => {
    return payments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'pending');
  };

  // Get all pending payments (for admin)
  const getAllPendingPayments = () => {
    return payments.filter(p => p.status === 'pending');
  };

  // Admin approves a payment -> enroll user
  const approvePayment = (paymentId) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        // Enroll the user when payment is approved
        enrollCourse(p.userId, p.courseId);
        return { ...p, status: 'completed', approvedAt: new Date().toISOString() };
      }
      return p;
    }));
  };

  // Admin rejects a payment
  const rejectPayment = (paymentId, reason) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: 'rejected', rejectedAt: new Date().toISOString(), rejectReason: reason || 'Payment not received' };
      }
      return p;
    }));
  };

  // Check if a UTR has already been used in any status
  const checkUTR = (utr) => {
    const existing = payments.find(p => p.transactionRef === utr);
    if (!existing) return { used: false };
    return { used: true, status: existing.status, paymentId: existing.id, userId: existing.userId, courseId: existing.courseId };
  };

  // Get user's payment for a course (any status)
  const getUserPaymentForCourse = (userId, courseId) => {
    return payments.filter(p => p.userId === userId && p.courseId === courseId).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const value = {
    user,
    users,
    courses,
    quizzes,
    enrollments,
    reviews,
    likedCourses,
    bookmarkedCourses,
    login,
    register,
    logout,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    addLesson,
    updateLesson,
    deleteLesson,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    enrollCourse,
    updateEnrollment,
    getEnrollment,
    completeLesson,
    completeCourse,
    recordQuizAttempt,
    getQuizAttempts,
    addPoints,
    updateUser,
    getUserBadge,
    addReview,
    getCourseReviews,
    addAttendee,
    removeAttendee,
    getCourseAttendees,
    sendAttendeeMessage,
    toggleLikeCourse,
    toggleBookmarkCourse,
    removeCourse,
    getBookmarkedCourses,
    payments,
    addPayment,
    getPaymentHistory,
    hasPurchased,
    checkUTR,
    getPendingPayment,
    getAllPendingPayments,
    approvePayment,
    rejectPayment,
    getUserPaymentForCourse,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
