const { MongoClient } = require('mongodb');

// Connection URL and DB name
const url = "mongodb://localhost:27017";
const dbName = "mydb"; // This will be created if it doesn't exist
const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("customers");

    // Example data to insert
    const customers = [
      { name: "John", address: "Highway 71" },
      { name: "Peter", address: "Lowstreet 4" },
      { name: "Amy", address: "Apple st 652" },
      { name: "ashik ali", address: "karunechi st 652" }
    ];

    // Insert many documents
    const result = await collection.insertMany(customers);
    console.log(`${result.insertedCount} documents were inserted.`);

  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await client.close();
  }
}

run();
