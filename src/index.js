require('dotenv').config();
const express = require('express');
const cors = require("cors");
const { connectDB, getDB, ObjectId } = require('./db');
const { initFirebase, firebaseAuthMiddleware } = require('./middleware/firebaseAuth');
const usersRouter = require('./routes/users');
// const serviceAccount = require("./serviceAccountKey.json");
const app = express();
// const path = require('path');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wihciah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '../../serviceAccountKey.json';
// init services
connectDB(MONGODB_URI);
initFirebase(FIREBASE_SERVICE_ACCOUNT);

// app.use(express.static(path.join(__dirname, 'public')));
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
    const products = await collection.find({IsImport:0}).sort({ createdAt: -1 }).limit(6).toArray();

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

    const products = await collection.find({IsImport:0}).sort({ createdAt: -1 }).toArray();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All products
app.get('/getsingleproduct/:id', firebaseAuthMiddleware, async (req, res) => {
  try {

    const db = getDB();
    const collection = db.collection("Product");
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const ProdId = new ObjectId(id);
    const product = await collection.findOne({ _id: ProdId });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/importproduct', firebaseAuthMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const Productcollection = db.collection("Product");

    // Get product data from request body
    const { _id, productImage, productName, price, originCountry, rating, availableQuantity,category, email } = req.body;

    // Basic validation
    if (!availableQuantity || !email) {
      return res.status(400).json({ message: "Quantity and Id are required" });
    }

    const newProduct = {
      productImage,
      productName,
      price,
      originCountry,
      rating,
      availableQuantity: parseInt(availableQuantity, 10),
      category,
      email,
      IsImport: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await Productcollection.insertOne(newProduct);

    await Productcollection.updateOne(
      { _id: new ObjectId(_id) },
      { $inc: { availableQuantity: - parseInt(availableQuantity) } }
    );

    res.status(201).json({ message: "Product Import successfully", productId: result.insertedId });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/getmyimport/:email', firebaseAuthMiddleware, async (req, res) => {
  try {

    const db = getDB();
    const collection = db.collection("Product");
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const myImport = await collection.find({ email: email,IsImport:1 }).toArray();

    res.status(200).json(myImport);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete('/deletemyimport/:id', firebaseAuthMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("Product");
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found or already deleted" });
    }

    res.status(200).json({ message: "Product successfully deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/getmyexports/:email', firebaseAuthMiddleware, async (req, res) => {
  try {

    const db = getDB();
    const collection = db.collection("Product");
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const myImport = await collection.find({ email: email,IsImport:0 }).toArray();

    res.status(200).json(myImport);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete('/deletemyexports/:id', firebaseAuthMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("Product");
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found or already deleted" });
    }

    res.status(200).json({ message: "Product successfully deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// catch all
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
