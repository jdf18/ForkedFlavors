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

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/login.html'));
});

app.get('/dashboard', requireLogin, (req, res) => {
    res.send(`Welcome, ${req.session.user.user_id}`);
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

app.all('/api/logout', (req, res) => {
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

module.exports = app;
