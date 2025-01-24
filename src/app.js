// Load environment variables from .env file
require('dotenv').config();

// Require path module for path manipulations
const path = require('path');

// Create an express app
const express = require('express');

const app = express();
const htmlRouter = express.Router();
const apiRouter = express.Router();

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

// Configure app to use json for http messages
app.use(express.json());

// Set static routes
app.use(express.static('static'));
app.use('/node_modules/bootstrap/dist', express.static('node_modules/bootstrap/dist'));

// * Import helper js scripts
const db = require('./db');
const recipes = require('./recipe');

const datastore = new db.Datastore('./data/');

// * Login system functions

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

// * ========== HTML GET Endpoints ==========

htmlRouter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/index.html'));
});

htmlRouter.get('/account', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../static/account.html'));
});

htmlRouter.get('/recipe', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../static/recipe.html'));
});

// * ========== API Endpoints ==========

const apiLog = (req, res, next) => {
    const d = new Date(); // get current datetime
    console.log(`Time: ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`, req.originalUrl);
    next();
};

apiRouter.use(apiLog);

// * ===== Login API Endpoints =====

apiRouter.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password is missing' });
    }

    const user = datastore.getUserFromUsername(username);
    if (!user) { // If the username does not exist in the database
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (password === user.password_hash) {
        loginUser(req, user);
        return res.status(200).json({ username, message: 'Login successful' });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
});

apiRouter.all('/logout', requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        logoutUser(res);
        return res.status(200).json({ message: 'Logged out' });
    });
});

apiRouter.get('/is_logged_in', (req, res) => {
    if (req.session.user) {
        return res.status(200).json(true);
    }
    return res.status(200).json(false);
});

// * ===== Profile Endpoints =====

apiRouter.post('/create_account', (req, res) => {
    // todo
    return res.status(501); // Not implemented yet
});

apiRouter.delete('/profile', requireLogin, (req, res) => {
    const user = datastore.getUserFromUserId(req.session.user.user_id);
    // todo
    return res.status(501); // Not implemented yet
});

apiRouter.get('/profile', requireLogin, (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Invalid username or password' });
    const user = datastore.getUserFromUserId(req.session.user.user_id);

    return res.status(200).json({
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
});

apiRouter.get('/profile/:username', requireLogin, (req, res) => {
    let user;
    if (req.params.username === 'self') {
        if (!req.session.user) return res.status(401).json({ message: 'Invalid username or password' });
        user = datastore.getUserFromUserId(req.session.user.user_id);
    } else {
        user = datastore.getUserFromUsername(req.params.username);
    }

    return res.status(200).json({
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
});

apiRouter.post('/modify_profile', requireLogin, (req, res) => {
    const user = datastore.getUserFromUserId(req.session.user.user_id);
    const { displayName, bio } = req.body;

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is missing' });
    }

    datastore.modifyUser(user.user_id, displayName, bio);

    return res.status(200).send('');
});

// * ===== Recipe Endpoints =====

apiRouter.post('/new_recipe', requireLogin, (req, res) => {
    // todo
    recipes.createNewRecipe();
    return res.status(501); // Not implemented yet
});

apiRouter.post('/fork_recipe', requireLogin, (req, res) => {
    // todo
    recipes.forkRecipe();
    return res.status(501); // Not implemented yet
});

apiRouter.post('/log_bake', requireLogin, (req, res) => {
    // todo
    recipes.logBake();
    return res.status(501); // Not implemented yet
});

app.use('/', htmlRouter);
app.use('/api', apiRouter);

module.exports = app;
