// Load environment variables from .env file
require('dotenv').config();

// Require path module for path manipulations
const path = require('path');

// * Import helper js scripts
const db = require('./db');
const recipes = require('./recipe');

const datastore = new db.Datastore('./data/');

// * Express configuration
const express = require('express');

const app = express();
const htmlRouter = express.Router();
const apiRouter = express.Router();

// Allow session data to be stored about each client in req.session
const session = require('express-session');
const FileStore = require('session-file-store')(session);

app.use(
    session({
        store: new FileStore({
            path: './sessions',
            ttl: 60 * 60 * 6,
            retries: 0,
        }),
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

const apiLog = (req, res, next) => {
    const d = new Date(); // get current datetime
    const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    const { method } = req;
    const endpoint = req.originalUrl;

    next();

    const delta = new Date((new Date()).getTime() - d.getTime());
    console.log(`${time} ${method} ${endpoint} ${res.statusCode} (${delta.getTime()}ms)`);
};

app.use(apiLog);

// Set static routes
app.use(express.static('static', {
    maxAge: '15m',
    immutable: true,
}));
app.use('/node_modules/bootstrap/dist', express.static('node_modules/bootstrap/dist'));

function sanitizeInput(input) {
    // Remove all HTML tags using a regular expression
    return input.replace(/<\/?[^>]+(>|$)/g, '');
}

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

function logoutUser(req, res) {
    res.clearCookie('connect.sid');
}

// * ========== HTML GET Endpoints ==========

htmlRouter.get('/', (req, res) => {
    res.setHeader('Cache-Control', `public, max-age=${60 * 15}`);
    res.sendFile(path.join(__dirname, '../static/index.html'));
});

htmlRouter.get('/account', requireLogin, (req, res) => {
    res.setHeader('Cache-Control', `public, max-age=${60 * 15}`);
    res.sendFile(path.join(__dirname, '../static/account.html'));
});
htmlRouter.get('/user/:_', requireLogin, (req, res) => {
    res.setHeader('Cache-Control', `public, max-age=${60 * 15}`);
    res.sendFile(path.join(__dirname, '../static/user.html'));
});

htmlRouter.get('/recipes', requireLogin, (req, res) => {
    res.setHeader('Cache-Control', `public, max-age=${60 * 15}`);
    res.sendFile(path.join(__dirname, '../static/recipes.html'));
});
htmlRouter.get('/recipe/:_', requireLogin, (req, res) => {
    res.setHeader('Cache-Control', `public, max-age=${60 * 15}`);
    res.sendFile(path.join(__dirname, '../static/recipe.html'));
});

// * ========== API Endpoints ==========

// apiRouter.use(apiLog);

// * ===== Login API Endpoints =====

apiRouter.post('/auth/login', (req, res) => {
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

apiRouter.all('/auth/logout', requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error logging out');
        }
    });
    return res.status(200).json({ message: 'Logged out' });
});

apiRouter.all('/auth/is_auth', (req, res) => {
    if (req.session.user) {
        return res.status(200).json(true);
    }
    return res.status(200).json(false);
});

// * ===== Profile Endpoints =====

apiRouter.post('/profile/create', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username or password is missing' });
    }

    const user = datastore.getUserFromUsername(username);
    if (user) { // If the username does not exist in the database
        return res.status(400).json({ message: 'Username has already been taken' });
    }

    datastore.createUser(username, password);
    return res.status(501); // Not implemented yet
});

apiRouter.all('/profile/delete', requireLogin, (req, res) => {
    const user = datastore.getUserFromUserId(req.session.user.user_id);

    datastore.deleteUser(user.username);
    return res.status(501); // Not implemented yet
});

apiRouter.get('/profile/get', requireLogin, (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Invalid username or password' });
    const user = datastore.getUserFromUserId(req.session.user.user_id);

    return res.status(200).json({
        username: user.username,
        id: user.user_id,
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
});

function getUserFromUsername(req, res, username) {
    let user;
    if (username === 'self') {
        if (!req.session.user) return res.status(401).json({ message: 'Invalid username or password' });
        user = datastore.getUserFromUserId(req.session.user.user_id);
    } else {
        user = datastore.getUserFromUsername(username);
    }

    return res.status(200).json({
        username: user.username,
        id: user.user_id,
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
}

apiRouter.get('/profile/get/:username', requireLogin, (req, res) => {
    return getUserFromUsername(req, res, req.params.username);
});

apiRouter.post('/profile/get_by_username', requireLogin, (req, res) => {
    const { username } = req.body;
    return getUserFromUsername(req, res, username);
});

apiRouter.post('/profile/get_by_id', requireLogin, (req, res) => {
    const { accountId } = req.body;
    const user = datastore.getUserFromUserId(accountId);

    return res.status(200).json({
        username: user.username,
        id: user.user_id,
        displayName: user.display_name,
        bio: user.bio,
        pfpLink: user.pfpLink,
    });
});

apiRouter.post('/profile/modify', requireLogin, (req, res) => {
    const user = datastore.getUserFromUserId(req.session.user.user_id);
    const { displayName, bio } = req.body;

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is missing' });
    }

    datastore.modifyUser(user.user_id, displayName, bio);

    return res.status(200).send('true');
});

// * ===== Recipe Endpoints =====

apiRouter.get('/recipes/get', requireLogin, (req, res) => {
    return res.status(200).json(recipes.getRecipes(datastore));
});

apiRouter.post('/recipe/get', requireLogin, (req, res) => {
    const { recipeId } = req.body;
    return res.status(200).json(recipes.getRecipe(datastore, Number(recipeId)));
});

apiRouter.get('/recipe/get/:recipeId', requireLogin, (req, res) => {
    return res.status(200).json(recipes.getRecipe(datastore, Number(req.params.recipeId)));
});

apiRouter.all('/recipe/create', requireLogin, (req, res) => {
    const recipeId = recipes.createNewRecipe(datastore, req.session.user.user_id);

    return res.json(recipeId);
});

apiRouter.post('/recipe/fork', requireLogin, (req, res) => {
    const { forkRecipeId } = req.body;
    const recipeId = recipes.forkRecipe(datastore, req.session.user.user_id, forkRecipeId);
    console.log(recipeId);
    return res.json(recipeId); // Not implemented yet
});

apiRouter.post('/recipe/edit', requireLogin, (req, res) => {
    const { recipeId, updatedContent } = req.body;
    if (recipes.getRecipe(datastore, recipeId).user === req.session.user.user_id) {
        recipes.editRecipe(datastore, recipeId, updatedContent);

        return res.status(200);
    }
    return res.status(401);
});

apiRouter.post('/recipe/delete', requireLogin, (req, res) => {
    const { recipeId } = req.body;
    if (recipes.getRecipe(datastore, recipeId).user === req.session.user.user_id) {
        datastore.deleteRecipe(recipeId);

        return res.status(200);
    }
    return res.status(401);
});

// apiRouter.post('/log_bake', requireLogin, (req, res) => {
//     // todo
//     recipes.logBake();
//     return res.status(501); // Not implemented yet
// });

app.use('/', htmlRouter);
app.use('/api', apiRouter);

module.exports = app;
