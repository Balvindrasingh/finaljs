const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const hbs = require('hbs');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/User');  // Import the User model

dotenv.config();

const app = express();

// Middleware for parsing requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up Handlebars (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register HBS Helpers
hbs.registerHelper('eq', (a, b) => a === b);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_default_secret_key',
        resave: false,
        saveUninitialized: false,
    })
);

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes

// Register page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle POST request to /register for user registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    req.flash('success_msg', 'Registration successful! You can now login.');
    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    req.flash('error_msg', 'Error registering user');
    res.redirect('/register');
  }
});

// Login page (GET route)
app.get('/login', (req, res) => {
  res.render('login');  // Render the login page
});

// Handle POST request to /login for user authentication
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/movies',  // Redirect to the movies page after successful login
    failureRedirect: '/login',  // Redirect back to the login page if login fails
    failureFlash: true,  // Show flash messages on failure
  })(req, res, next);
});

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback route
app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/login',
    }), (req, res) => {
        // Successful authentication, redirect to the movies page
        res.redirect('/movies');
    }
);

// Redirect root to login page if not logged in
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/movies');
  } else {
    return res.redirect('/login');
  }
});

// Export the app instance
module.exports = app;
