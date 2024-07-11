const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require('./db/database'); // Assuming your database setup
const usersRouter = require('./routes/users'); // Import the users router

const app = express();
const PORT = process.env.PORT || 3000;

// Use morgan for logging
app.use(morgan('dev'));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'Frontend')));

// Use the users router
app.use('/api/users', usersRouter);

// API endpoint to test the server
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
