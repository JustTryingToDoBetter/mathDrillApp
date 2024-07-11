const express = require('express');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config(); // Load environment variables
const db = require('./database/database');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Use morgan for logging
app.use(morgan('dev'));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Use the users router
app.use('/api/users', usersRouter);

// Serve the sign-up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend', 'signup.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend', 'login.html'));
});

// Serve the main page (home page)
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
});

// Serve the frontend
app.get('*', (req, res) => {
    res.redirect('/signup');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
