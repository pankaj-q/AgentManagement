const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set. Skipping seed.');
    process.exit(0);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected for seeding');

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        email: 'admin@example.com',
        password: 'admin123',
      });
      console.log('Admin user created:');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(0);
  }
};

seedAdmin();
