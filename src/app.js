require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');

const app = express();

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

app.use(express.json());

app.use(express.static('static'));
app.use('/node_modules/bootstrap/dist', express.static('node_modules/bootstrap/dist'));

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send('Please log in to access this page');
    }
    return next();
}

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password is missing' });
    }

    if (username === 'data' && password === 'data') {
        req.session.user = { user_id: 1 };
        return res.status(200).json({ username, message: 'Login successful' });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
});

app.all('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out' });
    });
});

app.get('/dashboard', requireLogin, (req, res) => {
    res.send(`Welcome, ${req.session.user.user_id}`);
});

module.exports = app;
