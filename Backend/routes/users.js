const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database/database');

const router = express.Router();
const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    throw new Error('JWT_SECRET must be defined');
}

// Sign-up route
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log('Hashed Password:', hashedPassword); // Log the hashed password
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

    db.run(query, [username, hashedPassword], function(err) {
        if (err) {
            console.error('Error inserting user:', err.message);
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
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (!row) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        console.log('Retrieved user from database:', row);
        console.log('Password provided:', password);
        console.log('Stored hash:', row.password);

        if (!password || !row.password) {
            return res.status(400).json({ message: 'Password is missing.' });
        }

        try {
            const isValid = bcrypt.compareSync(password, row.password);
            if (isValid) {
                const token = jwt.sign({ id: row.id, username: row.username }, secretKey);
                return res.json({ token });
            } else {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }
        } catch (compareError) {
            console.error('Error comparing passwords:', compareError);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    });
});

// Fetch user data
router.get('/me', (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        res.json({ id: decoded.id, username: decoded.username });
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

module.exports = router;
