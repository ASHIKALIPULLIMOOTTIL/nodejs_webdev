const { MongoClient } = require('mongodb');

const state = {
  db: null
};

const url = 'mongodb://localhost:27017';
const dbname = 'shopping';

module.exports.connect = async function () {
  if (state.db) return; // Prevent multiple connections

  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    state.db = client.db(dbname);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
};

module.exports.get = function () {
  return state.db;
};
