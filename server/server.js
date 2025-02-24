// In server.js
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const User = require('./models/User');
const cors = require('cors');
const mongoose = require('mongoose');
const favoritesRoute = require('./models/favorite');
const userRoutes = require('./routes');
const routes = require('./routes'); // Adjust the path as necessary

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Session setup
app.use(session({
  secret: 'adatch100@', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost/immobilierDB',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
  }
}));

// Middleware for checking authentication globally
app.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      req.user = user; // Attach the user object to req
      req.isAdmin = user.role === 'admin'; // Attach isAdmin flag to request
      next();
    } catch (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    req.isAdmin = false; // If no user is logged in, set isAdmin to false
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
app.use('/api/favorites', favoritesRoute); // Adjust the route as necessary
app.use('/api/users', userRoutes); // This means your routes in userRoutes.js start from /api

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
