const fs = require('fs');

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

class Datastore {
    constructor(path) {
        if (!fs.existsSync(path)) {
            throw new Error(`Database directory "${path}" does not exist.`);
        }
        this.path = path;

        this.users = null;
        this.recipes = null;
        this.comments = null;

        this.initialised = false;

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
            console.log('Datastore users.json does not exist: Creating');
            fs.writeFileSync(`${this.path}users.json`, JSON.stringify([]));
        }
        this.load();
        this.initialised = true;
    }

    save() {
        const usersJson = JSON.stringify(this.users);
        fs.writeFileSync(
            `${this.path}users.json`,
            usersJson,
        );
    }

    close() {
        if (!this.initialised) throw new Error('Database not initialized.');

        this.save();
        this.initialised = false;
        delete this;
    }

    getUserFromUserId(userId) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }
        const index = this.users.findIndex((user) => user.user_id === userId);
        if (index === -1) return null;

        return returnUserFromRow(this.users[index]);
    }

    getUserFromUsername(username) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const index = this.users.findIndex((user) => user.username === username);
        if (index === -1) return null;

        return returnUserFromRow(this.users[index]);
    }

    modifyUser(userId, displayName, bio) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const index = this.users.findIndex((user) => user.user_id === userId);
        if (index === -1) return false;

        this.users[index].display_name = displayName;
        this.users[index].bio = bio;

        this.save();

        return true;
    }
}

module.exports = {
    Datastore,
};
