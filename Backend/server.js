require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require('./database/database');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
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

// Redirect to signup page if no other routes match
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
