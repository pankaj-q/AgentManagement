const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      email: 'admin@example.com',
      password: 'admin123',
    });

    console.log('Admin user created:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedAdmin();
