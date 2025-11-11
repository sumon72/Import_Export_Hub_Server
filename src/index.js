require('dotenv').config();
const express = require('express');
const cors = require("cors");
const { connectDB, getDB,ObjectId } = require('./db');
const { initFirebase, firebaseAuthMiddleware } = require('./middleware/firebaseAuth');
const usersRouter = require('./routes/users');
// const serviceAccount = require("./serviceAccountKey.json");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wihciah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '../../serviceAccountKey.json';
// init services
connectDB(MONGODB_URI);
initFirebase(FIREBASE_SERVICE_ACCOUNT);


// routes
app.use('/api/users', usersRouter);

// example: protected route using middleware for a whole route
//firebaseAuthMiddleware
app.get('/api/protected', firebaseAuthMiddleware, (req, res) => {
  res.json({ message: 'You accessed a protected endpoint', user: req.user });
});

// Get Recent products
app.get('/recentProducts', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("Product");
    const products = await collection.find({}).sort({ createdAt: -1 }).limit(6).toArray();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All products
app.get('/allproducts', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("Product");
    const products = await collection.find({}).sort({ createdAt: -1 }).toArray();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All products
app.get('/getsingleproduct/:id',firebaseAuthMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("Product");
    const { id } = req.params;
    const objectId = new ObjectId(id);

    const products = await collection.findOne({ _id: objectId });
    
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// catch all
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
