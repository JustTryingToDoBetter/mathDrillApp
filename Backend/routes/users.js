const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');

const secretKey = process.env.SECRET_KEY; // Ensure this is loaded correctly

console.log("Secret Key in users.js:", secretKey); // Add this line to debug

// Register a user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const queryUser = `INSERT INTO users (username) VALUES (?)`;
        db.run(queryUser, [username], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                const userId = this.lastID;
                const queryPassword = `INSERT INTO passwords (user_id, password) VALUES (?, ?)`;
                db.run(queryPassword, [userId, hashedPassword], function (err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        res.status(201).json({ id: userId });
                    }
                });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login a user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const queryUser = `SELECT * FROM users WHERE username = ?`;
    db.get(queryUser, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const queryPassword = `SELECT password FROM passwords WHERE user_id = ?`;
        db.get(queryPassword, [user.id], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const isPasswordValid = await bcrypt.compare(password, row.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
    const queryUser = `SELECT username FROM users WHERE id = ?`;
    db.get(queryUser, [req.user.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(user);
    });
});

// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.user.userId });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

module.exports = router;
