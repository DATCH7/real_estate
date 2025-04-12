const express = require('express');
const multer = require('multer');
const path = require('path');
const Favorite = require('./models/favorite');
const User = require('./models/User');
const Admin = require('./models/admin');
const Property = require('./models/property');



const router = express.Router();

router.get('/checkAuth', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});



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

// Route to create an admin
router.post('/admin/create', async (req, res) => {
  const { userId, permissions } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const newAdmin = new Admin({
      userId: userId,
      permissions: permissions || ['manage-users'] // Default permission if not provided
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Error creating admin' });
  }
});


// Route to fetch all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find().populate('userId'); // Populate user info from the User collection
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for user and admin login
router.post('/login', async (req, res) => {
  // Check if user is already logged in
  if (req.session.userId) {
    return res.status(403).json({ success: false, message: 'User already logged in.' });
  }

  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Validate user and password (simple check without hashing)
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if the user is an admin
    if (user.role === 'admin') {
      console.log('Admin logged in:', user.email);
      // Optionally, you could perform additional checks for admins here
    }

    // Create a session for the user
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role // Store user role in session
    };

    // Log the session for debugging
    console.log('Session after login:', req.session);

    // Save the session
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session save failed.' });
      }
      return res.status(200).json({ success: true, message: 'Login successful!', user: req.session.user });
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  });
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
    res.json(user); // Return user data
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all users
router.get('/users', async (req, res) => {
  console.log('GET /api/users called'); // Debug log
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});



// Fetch all admins
router.get('/api/admins', async (_, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins' });
  }
});

// Example route to update user role
router.put('/users/role/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error });
  }
});

// Example route to delete user
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
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
router.post('/properties', upload.array('photos'), async (req, res) => {
  try {
    console.log('Received property publish request');

    // Check authentication
    if (!req.session.userId) {
      console.log('Unauthenticated publish attempt rejected');
      return res.status(401).json({ message: 'You must be logged in to publish a property' });
    }

    // Log received data for debugging
    console.log('Received property data:', {
      title: req.body.title,
      description: req.body.description ? req.body.description.substring(0, 30) + '...' : 'missing',
      price: req.body.price,
      surface: req.body.surface,
      rooms: req.body.rooms,
      type: req.body.type,
      address: req.body.address,
      category: req.body.category,
      photosCount: req.files ? req.files.length : 0
    });

    // Check required fields
    const requiredFields = ['title', 'description', 'price', 'surface', 'rooms', 'type', 'address', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Handle the photos
    let photoFilenames = [];
    if (req.files && req.files.length > 0) {
      photoFilenames = req.files.map(file => file.filename);
      console.log(`Processed ${photoFilenames.length} uploaded photos:`, photoFilenames);
    } else {
      console.log('No photos included in the upload');
    }

    // Extract property data from request body
    const { title, description, price, surface, rooms, type, address, category, diagnostics, equipment } = req.body;

    // Create new property document
    const property = new Property({
      title,
      description,
      price: parseFloat(price) || 0,
      surface: parseFloat(surface) || 0,
      rooms: parseInt(rooms) || 0,
      type,
      address,
      category,
      photos: photoFilenames,
      diagnostics,
      // Convert equipment to array if it's a string
      equipment: equipment ? (Array.isArray(equipment) ? equipment : [equipment]) : [],
      agentId: req.session.userId
    });

    // Save to database
    const savedProperty = await property.save();
    console.log('Property saved successfully with ID:', savedProperty._id);

    res.status(201).json({
      message: 'Property published successfully!',
      property: savedProperty
    });
  } catch (error) {
    console.error('Error publishing property:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});



// Fetch properties by category
router.get('/properties/category/:category', async (req, res) => {
  const { category } = req.params; // Destructure category

  try {
    const properties = await Property.find({ category });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties', error: err });
  }
});

// Route to add a property to favorites
router.post('/favorite', async (req, res) => {
  const { propertyId } = req.body;

  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user._id; // Use the authenticated user's ID

  try {
    // Check if this property is already favorited
    const existingFavorite = await Favorite.findOne({ userId, propertyId });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Property is already in favorites.' });
    }

    // Create a new favorite entry
    const newFavorite = new Favorite({ userId, propertyId });
    await newFavorite.save();

    return res.status(201).json({ message: 'Property added to favorites successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Route to remove a property from favorites
router.delete('/favorite', async (req, res) => {
  const { propertyId } = req.body;

  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.user._id; // Use the authenticated user's ID

  try {
    // Find and delete the favorite entry
    const result = await Favorite.findOneAndDelete({ userId, propertyId });
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    return res.status(200).json({ message: 'Property removed from favorites successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get all favorite properties for the user
router.get('/favorites', async (req, res) => {
  try {
    // Assuming user is authenticated and user id is available via req.user (adjust based on your auth logic)
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id; // Get authenticated user's ID
    const favorites = await Favorite.find({ userId }).populate('propertyId'); // Populate property details if needed

    if (!favorites.length) {
      return res.status(404).json({ message: 'No favorites found.' });
    }

    res.json(favorites); // Send the favorite properties to the frontend
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all properties (optional)
router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find(); // Fetch all properties
    res.json(properties);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ message: 'Error fetching properties', error: err });
  }
});

// Development route to create admin user
router.post('/dev/create-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'adamdatch100@gmail.com' });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin user already exists.' });
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'adamdatch100@gmail.com',
      password: 'admin123', // Simple password for development
      phone: '1234567890',
      role: 'admin',
      createdAt: new Date()
    });

    await adminUser.save();
    res.status(201).json({ success: true, message: 'Admin user created successfully!' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ success: false, message: 'Error creating admin user.' });
  }
});

module.exports = router;
