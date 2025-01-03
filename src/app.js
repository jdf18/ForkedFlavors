// Load environment variables from .env file
require('dotenv').config();

// Require path module for path manipulations
const path = require('path');

// Create an express app
const express = require('express');

const app = express();

// Allow session data to be stored about each client in req.session
const session = require('express-session');

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 6,
            secure: false,
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        },
    }),
);

// Configure express app
app.use(express.json());

app.use(express.static('static'));
app.use('/node_modules/bootstrap/dist', express.static('node_modules/bootstrap/dist'));

// Import database objects from ./db.js
const db = require('./db');

db.connect('./data/forkedflavors.db').then(() => {});

// Login system functions

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send('Please log in to access this page');
    }
    return next();
}

function loginUser(req, user) {
    req.session.user = { user_id: user.user_id };
}

function logoutUser(res) {
    res.clearCookie('connect.sid');
}

// Simple GET HTML API Endpoints

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/index.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/account.html'));
});

// Other API Endpoints

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password is missing' });
    }

    const user = await db.getUserFromUsername(username);
    if (!user) { // If the username does not exist in the database
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (password === user.password_hash) {
        loginUser(req, user);
        return res.status(200).json({ username, message: 'Login successful' });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
});

app.all('/api/logout', requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        logoutUser(res);
        return res.status(200).json({ message: 'Logged out' });
    });
});

app.get('/api/is_logged_in', async (req, res) => {
    if (req.session.user) {
        return res.status(200).json(true);
    }
    return res.status(200).json(false);
});

app.get('/api/profile/:username', async (req, res) => {
    let user;
    if (req.params.username === 'self') {
        if (!req.session.user) return res.status(401).json({ message: 'Invalid username or password' });
        user = await db.getUserFromUserId(req.session.user.user_id);
    } else {
        user = await db.getUserFromUsername(req.params.username);
    }
    console.log(user);

    return res.status(200).json({
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
});

app.post('/api/modify_profile', requireLogin, async (req, res) => {
    console.log('/api/modify_profile');
    const user = await db.getUserFromUserId(req.session.user.user_id);
    const { displayName, bio } = req.body;

    console.log(user.user_id, displayName, bio);

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is missing' });
    }

    await db.modifyUser(user.user_id, displayName, bio);

    return res.status(200).send('');
});

module.exports = app;
