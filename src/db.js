const fs = require('fs');

class Datastore {
    constructor(path) {
        if (!fs.existsSync(path)) {
            console.log('Error: datastore constructed with a non-existant path.');
        }
        this.path = path;

        this.users = null;
        this.recipes = null;
        this.comments = null;

        this.init_datastore();
    }

    load() {
        const usersJson = fs.readFileSync(
            `${this.path}users.json`,
        );
        this.users = JSON.parse(usersJson.toString('utf8'));
    }

    init_datastore() {
        // Check required files all exist, load into object
        if (!fs.existsSync(`${this.path}users.json`)) {
            console.log('Error: datastore users.json does not exist.');
        }
        this.load();
    }

    save() {
        if (!fs.existsSync(`${this.path}users.json`)) {
            console.log('Error: datastore users.json does not exist.');
        }
        const usersJson = JSON.stringify(this.users);
        fs.writeFileSync(
            `${this.path}users.json`,
            usersJson,
        );
    }

    close() {
        this.save();
        delete this;
    }
}

let datastore;

// Try to connect to the database file
function connect(databasePath) {
    // Check that the file exists
    if (!(fs.existsSync(databasePath) || databasePath === ':memory:')) {
        return new Promise((resolve, reject) => {
            reject(new Error(`Database file "${databasePath}" does not exist.`));
        });
    }

    datastore = new Datastore(databasePath);

    return true;
}

function getDb() {
    if (!datastore) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }
    return datastore;
}

function close() {
    if (!datastore) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }
    datastore.close();
    datastore = undefined;
}

function returnUserFromRow(user) {
    return {
        user_id: user.user_id,
        username: user.username,
        display_name: user.display_name,
        bio: user.bio,
        pfp_link: user.pfp_link,
        password_hash: user.password_hash,
    };
}

function getUserFromUserId(userId) {
    if (!datastore) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }
    const index = datastore.users.findIndex((user) => user.user_id === userId);
    if (index === undefined) {
        return null;
    }
    return returnUserFromRow(datastore.users[index]);
}

function getUserFromUsername(username) {
    if (!datastore) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }

    const index = datastore.users.findIndex((user) => user.username === username);
    if (index === undefined) {
        return null;
    }
    return returnUserFromRow(datastore.users[index]);
}

function modifyUser(userId, displayName, bio) {
    if (!datastore) {
        throw new Error('Database not yet initialized. Call `connect() first.`');
    }

    const index = datastore.users.findIndex((user) => user.user_id === userId);

    if (index === undefined) {
        return false;
    }

    datastore.users[index].display_name = displayName;
    datastore.users[index].bio = bio;

    datastore.save();

    return true;
}

module.exports = {
    connect,
    getDb,
    close,
    getUserFromUserId,
    getUserFromUsername,
    modifyUser,
};
