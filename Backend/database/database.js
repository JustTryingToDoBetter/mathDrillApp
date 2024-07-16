const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'math_drill_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`DROP TABLE IF EXISTS users`, (err) => {
                if (err) {
                    console.error('Error dropping users table:', err.message);
                } else {
                    console.log('Users table dropped.');
                    db.run(`CREATE TABLE users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE,
                        password TEXT
                    )`, (err) => {
                        if (err) {
                            console.error('Error creating users table:', err.message);
                        } else {
                            console.log('Users table created.');
                        }
                    });
                }
            });
        });
    }
});

module.exports = db;
