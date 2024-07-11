const express = require('express');
const router = express.Router();
const db = require('../database/database'); // Corrected path to the database

// Add a user
router.post('/', (req, res) => {
    const { username } = req.body;
    const query = `INSERT INTO users (username) VALUES (?)`;
    db.run(query, [username], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
});

// Get user scores
router.get('/:user_id/scores', (req, res) => {
    const { user_id } = req.params;
    const query = `SELECT * FROM scores WHERE user_id = ? ORDER BY date DESC`;
    db.all(query, [user_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

module.exports = router;
