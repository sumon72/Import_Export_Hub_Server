const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");

let client;
let db;

async function connectDB(uri) {
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log("✅ MongoDB connected successfully");

    db = client.db("Product_Export_Import");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
}

module.exports = { connectDB, getDB,ObjectId };
