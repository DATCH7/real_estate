const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('./models/User'); // Adjust path as necessary
const Property = require('./models/Property'); // Adjust the path as necessary
const { isAuthenticated } = require('./middleware/auth'); // Adjust the path as necessary 

const router = express.Router();






// Signup route
router.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;

  if (!first_name || !last_name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const newUser = new User({
      firstName: first_name,
      lastName: last_name,
      email,
      password, // Store the password directly
      phone,
      role: 'user',
      createdAt: new Date()
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Route for login
router.post('/login', async (req, res) => {
  if (req.session.userId) {
    return res.status(403).json({ success: false, message: 'User already logged in.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Create a session for the user
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role
    };

    // Log the session to ensure it's being set
    console.log('Session after login:', req.session);

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session save failed.' });
      }
      return res.status(200).json({ success: true, message: 'Login successful!' });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});


// Route to fetch user data
router.get('/getUserData', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
});


// Check authentication route
router.get('/checkAuth', (req, res) => {
  if (req.session && req.session.user) {
      // User is authenticated, return user data
      return res.status(200).json({
          isAuthenticated: true,
          user: req.session.user // Return the user data
      });
  } else {
      // User is not authenticated
      return res.status(401).json({ isAuthenticated: false, message: 'User not logged in.' });
  }
});

//Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Path to your uploads folder
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

// Property publishing route (Authenticated)
router.post('/properties', isAuthenticated, upload.array('photos'), async (req, res) => {
  try {
      const { title, description, price, surface, rooms, type, address, category, diagnostics, equipment } = req.body;

     
      const property = new Property({
          title,
          description,
          price,
          surface,
          rooms,
          type,
          address,
          category,
          photos: req.files.map(file => file.path), 
          diagnostics,
          equipment,
          agentId: req.session.userId 
      });

      
      await property.save();
      res.status(201).json({ message: 'Property published successfully!', property });
  } catch (error) {
      console.error('Error publishing property:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



// Fetch properties by category
router.get('/properties/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const properties = await Property.find({ category });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties', error: err });
  }
});

module.exports = router;
