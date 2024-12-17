const sqlite3 = require('sqlite3').verbose();

// Try to connect to the database file
const db = new sqlite3.Database('./data/forkedflavors.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to the ForkedFlavors database.');
    }
});

// Create tables if they don’t exist
db.serialize(() => {
    // Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
    `);

    // Recipes Table with JSON column
    db.run(`
        CREATE TABLE IF NOT EXISTS recipes (
            recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            recipe_data TEXT NOT NULL, -- JSON stored as TEXT
            forked_from INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (forked_from) REFERENCES recipes(forked_from)
        );
    `);

    // Comments Table
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            comment_text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    `);
});

async function getUserFromUserId(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE user_id = ?';

        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Error querying the database:', err.message);
                reject(err);
            } else {
                resolve(row); // If no user is found, `row` will be null
            }
        });
    });
}

async function getUserFromUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ?';

        db.get(query, [username], (err, row) => {
            if (err) {
                console.error('Error querying the database:', err.message);
                reject(err);
            } else {
                resolve(row); // If no user is found, `row` will be null
            }
        });
    });
}

module.exports = {
    db,
    getUserFromUserId,
    getUserFromUsername,
};
