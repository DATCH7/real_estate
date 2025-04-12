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
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration using the cors package
app.use(cors({
  origin: true, // Allow all origins during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
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
}).then(() => {
  console.log('MongoDB connected');

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }

  // Make sure server listens on all interfaces
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access server at http://localhost:${PORT} or http://192.168.1.175:${PORT}`);
  });
})
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Use routes
app.use('/api', routes); // Use the routes defined in routes.js
app.use('/api/favorites', favoritesRoute); // Adjust the route as necessary
app.use('/api/users', userRoutes); // This means your routes in userRoutes.js start from /api

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a test route for uploads directory
app.get('/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res.status(500).json({
        error: 'Error reading uploads directory',
        message: err.message
      });
    }

    res.json({
      message: 'Uploads directory accessible',
      fileCount: files.length,
      files: files.map(file => ({
        name: file,
        url: `${req.protocol}://${req.get('host')}/uploads/${file}`
      }))
    });
  });
});