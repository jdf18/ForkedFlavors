const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();

let db;

// Try to connect to the database file
function connect(databasePath) {
    // Check that the file exists
    if (!(fs.existsSync(databasePath) || databasePath === ':memory:')) {
        return new Promise((resolve, reject) => {
            reject(new Error(`Database file "${databasePath}" does not exist.`));
        });
    }

    return new Promise((resolve, reject) => {
        // Connect to the database
        db = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.log('Error connecting to database:', err.message);
                return reject(new Error(`Error connecting to database: ${err.message}`));
            }
            console.log(`Connected to the ForkedFlavors database. ${databasePath}`);
            return resolve();
        });

        // Create tables if they don’t exist
        db.serialize(() => {
            // Users Table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    display_name TEXT UNIQUE NOT NULL,
                    bio TEXT,
                    pfp_link TEXT,
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
            resolve();
        });
    });
}

function getDb() {
    if (!db) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }
    return db;
}

function close() {
    if (!db) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }
    db.close();
    db = undefined;
}

function returnUserFromRow(row) {
    return {
        user_id: row.user_id,
        username: row.username,
        display_name: row.display_name,
        bio: row.bio,
        pfp_link: row.pfp_link,
        password_hash: row.password_hash,
    };
}

async function getUserFromUserId(userId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not yet initialized. Call `connect() first.`'));
            return;
        }

        const query = 'SELECT * FROM users WHERE user_id = ?';

        db.get(query, [userId], (err, row) => {
            if (err) {
                reject(new Error(`Error querying the database: ${err.message}`));
            } else if (!row) { // If no user is found, `row` will be null
                resolve(null);
            } else {
                resolve(returnUserFromRow(row));
            }
        });
    });
}

async function getUserFromUsername(username) {
    if (!db) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }

    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ?';

        db.get(query, [username], (err, row) => {
            if (err) {
                return reject(new Error(`Error querying the database: ${err.message}`));
            } if (!row) { // If no user is found, `row` will be null
                return resolve(null);
            }
            return resolve(returnUserFromRow(row)); // If no user is found, `row` will be null
        });
    });
}

async function modifyUser(userId, displayName, bio) {
    if (!db) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }

    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET display_name = ?, bio = ? WHERE user_id = ?';

        db.run(query, [displayName, bio, userId], (err, res) => {
            if (err) {
                return reject(new Error(`Error querying the database: ${err.message}`));
            }
            return resolve(res);
        });
    });
}

module.exports = {
    connect,
    getDb,
    close,
    getUserFromUserId,
    getUserFromUsername,
    modifyUser,
};
