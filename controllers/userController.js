const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const GOOGLE_CLIENT_ID = '594467072263-lf728772tc2cmm2vsshnpns6jptlr268.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper function to generate a unique username
const generateUniqueUsername = async (baseName) => {
  let username = baseName.toLowerCase().replace(/ /g, '') + Math.floor(Math.random() * 1000);
  while (await User.findOne({ username })) {
    username = baseName.toLowerCase().replace(/ /g, '') + Math.floor(Math.random() * 1000);
  }
  return username;
};

exports.signup = async (req, res) => {
  try {
    console.log('Received signup request:', req.body);
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique username from the name
    const username = await generateUniqueUsername(name);

    // Create new user
    const user = new User({
      name,
      email,
      username, // Save the generated username
      password: hashedPassword
    });

    await user.save();
    console.log('User created successfully:', name);

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      // Return user object for UI update
      user: { name: user.name, email: user.email, picture: user.picture, username: user.username }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', user.name);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      // Return user object for UI update
      user: { name: user.name, email: user.email, picture: user.picture, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.googleSignIn = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    // Destructure name, email, and picture from Google token payload
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update their picture if it's different
      if (user.picture !== picture) {
        user.picture = picture;
        await user.save();
      }
      console.log('Google user exists, logging in:', name);
    } else {
      // If user does not exist, create a new one with Google data
      console.log('New Google user, creating account:', name);
      const password = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate a unique username from the Google name
      const username = await generateUniqueUsername(name);

      user = new User({
        name,
        email,
        username, // Save the generated username
        password: hashedPassword,
        picture, // Save the profile picture URL
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Google Sign-In successful',
      // Return user object for UI update
      user: { name: user.name, email: user.email, picture: user.picture, username: user.username },
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    res.status(400).json({ success: false, message: 'Invalid Google token' });
  }
};