require('dotenv').config();
const express = require('express');
const {connectDB} = require('./db');
const { initFirebase, firebaseAuthMiddleware } = require('./middleware/firebaseAuth');
const usersRouter = require('./routes/users');
// const serviceAccount = require("./serviceAccountKey.json");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wihciah.mongodb.net/?appName=Cluster0`
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT || '../../serviceAccountKey.json';
// init services
connectDB(MONGODB_URI);
initFirebase(FIREBASE_SERVICE_ACCOUNT);

// routes
app.use('/api/users', usersRouter);

// example: protected route using middleware for a whole route
//firebaseAuthMiddleware
app.get('/api/protected',firebaseAuthMiddleware, (req, res) => {

    
  res.json({ message: 'You accessed a protected endpoint', user: req.user });
});

// catch all
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
