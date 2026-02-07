const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnsphere';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out to keep existing data)
    // await User.deleteMany({});
    // await Course.deleteMany({});

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@learnsphere.com',
      password: 'admin123456', // Will be hashed automatically
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      points: 1000,
      isActive: true,
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create instructor user
    const instructorUser = new User({
      name: 'Instructor User',
      email: 'instructor@learnsphere.com',
      password: 'instructor123456',
      role: 'instructor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor',
      points: 500,
      isActive: true,
    });
    await instructorUser.save();
    console.log('✅ Instructor user created');

    // Create learner users
    const learnerUser1 = new User({
      name: 'John Learner',
      email: 'john@learnsphere.com',
      password: 'learner123456',
      role: 'learner',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      points: 150,
      isActive: true,
    });
    await learnerUser1.save();
    console.log('✅ Learner user 1 created');

    const learnerUser2 = new User({
      name: 'Sarah Learner',
      email: 'sarah@learnsphere.com',
      password: 'learner123456',
      role: 'learner',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      points: 200,
      isActive: true,
    });
    await learnerUser2.save();
    console.log('✅ Learner user 2 created');

    // Create sample courses
    const course1 = new Course({
      title: 'React Fundamentals',
      description: 'Learn the basics of React and build interactive user interfaces',
      tags: ['react', 'javascript', 'web-development'],
      image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400',
      price: 49.99,
      visibility: 'public',
      access: 'paid',
      published: true,
      responsibleId: instructorUser._id,
      adminId: adminUser._id,
      lessons: [
        {
          type: 'video',
          title: 'Introduction to React',
          duration: 30,
          url: 'https://example.com/lesson1',
          attachments: ['setup-guide.pdf'],
        },
        {
          type: 'document',
          title: 'Component Basics',
          duration: 20,
          url: 'https://example.com/lesson2',
          attachments: ['components-guide.pdf'],
        },
      ],
    });
    await course1.save();
    console.log('✅ Course 1 created');

    const course2 = new Course({
      title: 'JavaScript Advanced',
      description: 'Master advanced JavaScript concepts and patterns',
      tags: ['javascript', 'programming', 'advanced'],
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
      price: 59.99,
      visibility: 'public',
      access: 'paid',
      published: true,
      responsibleId: instructorUser._id,
      adminId: adminUser._id,
      lessons: [
        {
          type: 'video',
          title: 'Closures and Scope',
          duration: 40,
          url: 'https://example.com/lesson3',
          attachments: ['closures.pdf'],
        },
        {
          type: 'quiz',
          title: 'Closure Quiz',
          duration: 15,
          url: 'https://example.com/quiz1',
        },
      ],
    });
    await course2.save();
    console.log('✅ Course 2 created');

    const course3 = new Course({
      title: 'Web Design Essentials',
      description: 'Learn modern web design principles and best practices',
      tags: ['design', 'ui-ux', 'web'],
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      price: 39.99,
      visibility: 'public',
      access: 'free',
      published: true,
      responsibleId: instructorUser._id,
      adminId: adminUser._id,
      lessons: [
        {
          type: 'video',
          title: 'Design Principles',
          duration: 35,
          url: 'https://example.com/lesson5',
        },
        {
          type: 'document',
          title: 'Color Theory',
          duration: 25,
          url: 'https://example.com/lesson6',
          attachments: ['color-guide.pdf'],
        },
      ],
    });
    await course3.save();
    console.log('✅ Course 3 created');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Test Credentials:');
    console.log('Admin: admin@learnsphere.com / admin123456');
    console.log('Instructor: instructor@learnsphere.com / instructor123456');
    console.log('Learner: john@learnsphere.com / learner123456');
    console.log('Learner: sarah@learnsphere.com / learner123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
