// In server.js
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes'); // Adjust the path as necessary

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session setup
app.use(session({
  secret: 'adatch100@', // Make sure to replace this with a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost/immobilierDB',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
  }
}));

// Middleware for checking authentication globally
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    User.findById(req.session.userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        next();
      })
      .catch(err => {
        return res.status(500).json({ error: 'Internal server error' });
      });
  } else {
    next(); // No user, just proceed
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost/immobilierDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api', routes); // Use the routes defined in routes.js

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
