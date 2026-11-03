const { MongoClient } = require('mongodb');

const state = {
  db: null
};

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbname = process.env.MONGO_DB || 'shopping';

module.exports.connect = async function () {
  if (state.db) return; // Prevent multiple connections

  const client = await MongoClient.connect(url);
  state.db = client.db(dbname);
};

module.exports.get = function () {
  return state.db;
};
