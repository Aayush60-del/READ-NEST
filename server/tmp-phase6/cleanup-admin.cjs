require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteOne({ email: process.argv[2] });
  await mongoose.disconnect();
})();
