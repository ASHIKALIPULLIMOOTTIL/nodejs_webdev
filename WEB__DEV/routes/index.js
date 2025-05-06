const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'ashikalidb';

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup', async function(req, res) {
  console.log("Request Body:", req.body);

  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const result = await db.collection('newuser').insertOne(req.body);
    console.log("✅ Inserted user with ID:", result.insertedId);

    res.send("Signup successful");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    res.status(500).send("Signup failed");
  } finally {
    await client.close();
  }
});

module.exports = router;
