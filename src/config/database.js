const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.Error = require('../errors/MongooseError');

const DB_CONNECTION = process.env.MONGODB_CONNECTION;

const db = (async () => {
  try {
    await mongoose.connect(DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
})();

module.exports = db;
