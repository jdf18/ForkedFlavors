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

function sanitizeHtml(text) {
    text = text.replaceAll('<div>', '');
    text = text.replaceAll('<br>', '');
    text = text.replaceAll('</div>', '');
    text = text.replaceAll('<strong>', '');
    text = text.replaceAll('</strong>', '');

    let scope = 0;
    let insideTag = false;

    let out = '';

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '<') {
            scope += 1;
            insideTag = true;
            i++;
            if (text[i] === '/') {
                scope -= 2;
            }
        } else if (text[i] === '>') {
            insideTag = false;
        } else if (scope === 0 && (!insideTag)) {
            out += text[i];
        }
    }

    return out;
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
        const metaJson = fs.readFileSync(
            `${this.path}meta.json`,
        );
        this.meta = JSON.parse(metaJson.toString('utf8'));

        const usersJson = fs.readFileSync(
            `${this.path}users.json`,
        );
        this.users = JSON.parse(usersJson.toString('utf8'));

        const recipesJson = fs.readFileSync(
            `${this.path}recipes.json`,
        );
        this.recipes = JSON.parse(recipesJson.toString('utf8'));
    }

    init_datastore() {
        // Check required files all exist, load into object
        if (!fs.existsSync(`${this.path}meta.json`)) {
            console.log('Datastore meta.json does not exist: Creating');
            fs.writeFileSync(`${this.path}meta.json`, JSON.stringify({
                next_ids: {
                    user: 0,
                    recipe: 0,
                },
            }));
        }
        if (!fs.existsSync(`${this.path}users.json`)) {
            console.log('Datastore users.json does not exist: Creating');
            fs.writeFileSync(`${this.path}users.json`, JSON.stringify([]));
        }
        if (!fs.existsSync(`${this.path}recipes.json`)) {
            console.log('Datastore recipes.json does not exist: Creating');
            fs.writeFileSync(`${this.path}recipes.json`, JSON.stringify([]));
        }

        this.load();

        // todo: Check meta information is valid

        this.initialised = true;
    }

    save() {
        const metaJson = JSON.stringify(this.meta);
        fs.writeFileSync(
            `${this.path}meta.json`,
            metaJson,
        );

        const usersJson = JSON.stringify(this.users);
        fs.writeFileSync(
            `${this.path}users.json`,
            usersJson,
        );

        const recipesJson = JSON.stringify(this.recipes);
        fs.writeFileSync(
            `${this.path}recipes.json`,
            recipesJson,
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

    createUser(username, password) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const newUserID = this.meta.next_ids.user;
        this.meta.next_ids.user += 1;

        this.users.push({
            user_id: newUserID,
            username,
            display_name: username,
            bio: '',
            pfp_link: null,
            password_hash: password,
        });

        this.save();

        return true;
    }

    deleteUser(username) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        this.users = this.users.filter((item) => !(item.username === username));

        this.save();
        return true;
    }

    createEmptyRecipe(userId) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const newRecipeID = this.meta.next_ids.recipe;
        this.meta.next_ids.recipe += 1;

        this.recipes.push({
            recipe_id: newRecipeID,
            upstream: null,
            title: 'Untitled Recipe',
            photo: null,
            ingredients: [],
            method: [],
            owner_id: userId,
            bakes: [],
        });

        this.save();

        return newRecipeID;
    }

    getRecipe(recipeId) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const index = this.recipes.findIndex((recipe) => recipe.recipe_id === recipeId);
        if (index === -1) return false;

        return {
            title: this.recipes[index].title,
            ingredients: this.recipes[index].ingredients,
            method: this.recipes[index].method,
            image: (this.recipes[index].photo === null) ? '/img/header-background.jpg' : this.recipes[index].photo,
            user: this.recipes[index].owner_id,
        };
    }

    editRecipe(recipeId, title, ingredients, method, photo) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        const index = this.recipes.findIndex((recipe) => recipe.recipe_id === recipeId);
        if (index === -1) return false;

        this.recipes[index].title = sanitizeHtml(title);
        this.recipes[index].ingredients = ingredients.map(sanitizeHtml);
        this.recipes[index].method = method.map(sanitizeHtml);
        this.recipes[index].photo = (sanitizeHtml(photo) === '/img/header-background.jpg') ? null : sanitizeHtml(photo);

        this.save();

        return true;
    }

    deleteRecipe(recipeId) {
        if (!this.initialised) {
            throw new Error('Database not initialized.');
        }

        this.recipes = this.recipes.filter((item) => !(item.recipe_id === recipeId));

        this.save();
        return true;
    }
}

module.exports = {
    Datastore,
};
