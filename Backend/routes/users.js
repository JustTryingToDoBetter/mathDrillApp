const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database/database');

const router = express.Router();
const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    throw new Error('JWT_SECRET must be defined');
}

// Middleware to validate token
const validateToken = (req, res, next) => {
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        req.user = jwt.verify(token, secretKey);
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// Sign-up route
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

    db.run(query, [username, hashedPassword], function(err) {
        if (err) {
            res.status(500).json({ message: 'User already exists.' });
        } else {
            res.status(201).json({ message: 'User created successfully.' });
        }
    });
});

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!row) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isValid = bcrypt.compareSync(password, row.password);
        if (isValid) {
            const token = jwt.sign({ id: row.id, username: row.username }, secretKey);
            return res.json({ token });
        } else {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
    });
});

// Fetch user data
router.get('/me', validateToken, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
});

// Save drill score
router.post('/save-score', validateToken, (req, res) => {
    const { drillType, score } = req.body;
    if (!drillType || score === undefined) {
        return res.status(400).json({ message: 'Bad Request: Missing drillType or score' });
    }

    const userId = req.user.id;
    const date = new Date().toISOString();
    const query = 'INSERT INTO scores (user_id, drill_type, score, date) VALUES (?, ?, ?, ?)';

    db.run(query, [userId, drillType, score, date], function(err) {
        if (err) {
            console.error('Error saving score:', err.message);
            return res.status(500).json({ message: 'Failed to save score' });
        } else {
            res.status(201).json({ message: 'Score saved successfully' });
        }
    });
});

// Get drill history
router.get('/history', validateToken, (req, res) => {
    const query = 'SELECT * FROM scores WHERE user_id = ? ORDER BY date DESC';
    db.all(query, [req.user.id], (err, rows) => {
        if (err) {
            console.error('Error fetching history:', err.message);
            return res.status(500).json({ message: 'Failed to fetch history' });
        } else {
            res.json(rows);
        }
    });
});

router.get('/profile', validateToken, (req, res) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.get(query, [req.user.id], (err, row) => {
        if (err) {
            console.error('Error fetching profile:', err.message);
            return res.status(500).json({ message: 'Failed to fetch profile' });
        } else {
            res.json(row);
        }
    });
});

router.get('/profile', validateToken, (req, res) => {
    const query = 'SELECT username, progress, bio FROM users WHERE id = ?';
    db.get(query, [req.user.id], (err, row) => {
        if (err) {
            console.error('Error fetching profile:', err.message);
            return res.status(500).json({ message: 'Failed to fetch profile' });
        } else {
            res.json(row);
        }
    });
});

router.post('/profile', validateToken, (req, res) => {
    const { email, profile_picture, bio } = req.body;
    const query = 'UPDATE users SET bio = ? WHERE id = ?';
    db.run(query, [email, profile_picture, bio, req.user.id], function(err) {
        if (err) {
            console.error('Error updating profile:', err.message);
            return res.status(500).json({ message: 'Failed to update profile' });
        } else {
            res.status(200).json({ message: 'Profile updated successfully' });
        }
    });
});

module.exports = router;
