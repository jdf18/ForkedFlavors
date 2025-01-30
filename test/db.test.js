const fs = require('fs');
const path = require('path');

const db = require('../src/db');

const TEST_DB_DIR = path.join(__dirname, '../test-data/');

beforeAll(() => {
    if (!fs.existsSync(TEST_DB_DIR)) {
        fs.mkdirSync(TEST_DB_DIR);
    }
});

afterAll(() => {
    if (fs.existsSync(TEST_DB_DIR)) {
        fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
    }
});

function getCurrentTestDir() {
    const state = expect.getState();
    const testName = state.currentTestName || 'unknown';

    // Sanitize test name for safe file names
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${path.join(
        TEST_DB_DIR,
        sanitizedTestName,
    )}/`;
}

function cleanTestDir() {
    // Clean up the file after the tests are completed
    if (fs.existsSync(getCurrentTestDir())) {
        fs.rmSync(getCurrentTestDir(), { recursive: true, force: true });
    }
}

function createTestDir() {
    cleanTestDir();

    // Create the directory
    fs.mkdirSync(getCurrentTestDir());
    expect(fs.existsSync(getCurrentTestDir())).toBe(true);
}

describe('Database initialization', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should fail to initialize the database from a non-existing directory', async () => {
        cleanTestDir();

        // Check that the database file does not exist
        expect(fs.existsSync(getCurrentTestDir())).toBe(false);

        await expect(() => {
            const datastore = new db.Datastore(getCurrentTestDir());
            datastore.close();
        }).toThrow(`Database directory "${getCurrentTestDir()}" does not exist.`);
    });

    it('Should initialize the database from a existing empty directory', async () => {
        // Check that the database directory exists
        expect(fs.existsSync(getCurrentTestDir())).toBe(true);
        // todo check directory is empty

        const datastore = new db.Datastore(getCurrentTestDir());
        expect(datastore.initialised).toBe(true);
        expect(datastore.users).toStrictEqual([]);
        // expect(datastore.recipes).toStrictEqual([]); // todo
        datastore.close();
    });

    it('Should fail to close db object if not connected', () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();
        expect(() => {
            datastore.close();
        }).toThrow('Database not initialized.');
    });
});

describe('Database getUserFromUserId method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.getUserFromUserId(1);
        }).toThrow('Database not initialized.');
    });

    it('Should return a user object when given a valid user id', async () => {
        let datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        // Check cache is updated
        expect(datastore.getUserFromUserId(1)).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });

        // Check file is updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.getUserFromUserId(1)).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });
    });

    it('Should return null when given an invalid user id', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.getUserFromUserId(2)).toBe(null); // ? Should cover l69
        expect(datastore.getUserFromUserId('invalid_data')).toBe(null);

        datastore.close();
    });
});

describe('Database getUserFromUsername method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.getUserFromUsername('test_user');
        }).toThrow('Database not initialized.');
    });

    it('Should return a user object when given a valid username', async () => {
        let datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        // Check cache is updated
        expect(datastore.getUserFromUsername('test_user')).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });

        // Check file is updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.getUserFromUsername('test_user')).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });

        datastore.close();
    });

    it('Should return null when given an invalid username', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.getUserFromUsername('invalid_name')).toBe(null);
        expect(datastore.getUserFromUsername(212)).toBe(null);

        datastore.close();
    });
});

describe('Database modifyUser method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.modifyUser(1, 'display name', 'bio');
        }).toThrow('Database not initialized.');
    });

    it('Should update the users details in the datastore', async () => {
        let datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'incorrect_display',
            bio: 'incorrect_bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.modifyUser(1, 'display', 'bio')).toBe(true);

        expect(datastore.users).toStrictEqual([{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.users).toStrictEqual([{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }]);
    });

    it('Should work with getUserFromUserId method', async () => {
        let datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'incorrect_display',
            bio: 'incorrect_bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.modifyUser(1, 'display', 'bio')).toBe(true);

        // Check cache is updated
        expect(datastore.getUserFromUserId(1)).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.getUserFromUserId(1)).toEqual({
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        });
    });

    it('Should throw an error when given an invalid user id', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'incorrect_display',
            bio: 'incorrect_bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.modifyUser(2, 'display', 'bio')).toBe(false);

        datastore.close();
    });
});

describe('Database createUser method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.createUser('test-username', 'test-password');
        }).toThrow('Database not initialized.');
    });

    it('Should create a new user in the datastore users object', () => {
        let datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = { next_ids: { user: 2, recipe: 2 } };

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.createUser('test-username', 'test-password')).toBe(true);

        expect(datastore.users).toStrictEqual([
            {
                user_id: 1,
                username: 'test_user',
                display_name: 'display',
                bio: 'bio',
                pfp_link: 'pfp',
                password_hash: 'test_password',
            },
            {
                user_id: 2,
                username: 'test-username',
                display_name: 'test-username',
                bio: '',
                pfp_link: null,
                password_hash: 'test-password',
            },
        ]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.users).toStrictEqual([
            {
                user_id: 1,
                username: 'test_user',
                display_name: 'display',
                bio: 'bio',
                pfp_link: 'pfp',
                password_hash: 'test_password',
            },
            {
                user_id: 2,
                username: 'test-username',
                display_name: 'test-username',
                bio: '',
                pfp_link: null,
                password_hash: 'test-password',
            },
        ]);
    });
});

describe('Database deleteUser method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.deleteUser('test-username');
        }).toThrow('Database not initialized.');
    });

    it('Should delete the specified user in the datastore users object', () => {
        let datastore = new db.Datastore(getCurrentTestDir());

        datastore.users = [{
            user_id: 1,
            username: 'test_user',
            display_name: 'display',
            bio: 'bio',
            pfp_link: 'pfp',
            password_hash: 'test_password',
        }];

        expect(datastore.deleteUser('test_user')).toBe(true);

        expect(datastore.users).toStrictEqual([]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.users).toStrictEqual([]);
    });
});

describe('Database createEmptyRecipe method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.createEmptyRecipe(0);
        }).toThrow('Database not initialized.');
    });

    it('Should create a new recipe in the datastore recipes object', () => {
        let datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = { next_ids: { user: 2, recipe: 2 } };

        datastore.recipes = [{
            recipe_id: 0,
            upstream: null,
            title: 'First Recipe',
            description: '',
            photo: null,
            ingredients: [],
            method: [],
            owner_id: 0,
            bakes: [],
        }];

        const recipeId = datastore.createEmptyRecipe(2);
        expect(typeof recipeId).toBe('number');

        expect(datastore.recipes).toStrictEqual([
            {
                recipe_id: 0,
                upstream: null,
                title: 'First Recipe',
                description: '',
                photo: null,
                ingredients: [],
                method: [],
                owner_id: 0,
                bakes: [],
            },
            {
                recipe_id: recipeId,
                upstream: null,
                title: 'Untitled Recipe',
                description: '',
                photo: null,
                ingredients: [],
                method: [],
                owner_id: 2,
                bakes: [],
            },
        ]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.recipes).toStrictEqual([
            {
                recipe_id: 0,
                upstream: null,
                title: 'First Recipe',
                description: '',
                photo: null,
                ingredients: [],
                method: [],
                owner_id: 0,
                bakes: [],
            },
            {
                recipe_id: recipeId,
                upstream: null,
                title: 'Untitled Recipe',
                description: '',
                photo: null,
                ingredients: [],
                method: [],
                owner_id: 2,
                bakes: [],
            },
        ]);
    });
});

describe('Database getRecipe method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.getRecipe(0);
        }).toThrow('Database not initialized.');
    });

    it('Should create a new recipe in the datastore recipes object', () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = { next_ids: { user: 2, recipe: 2 } };

        datastore.recipes = [{
            recipe_id: 0,
            upstream: null,
            title: 'First Recipe',
            description: 'test description',
            photo: '/path/to/test.png',
            ingredients: ['ingredients', 'list'],
            method: ['list', 'of', 'steps'],
            owner_id: 0,
            bakes: [],
        }];

        expect(datastore.getRecipe(0)).toStrictEqual({
            upstream: null,
            title: 'First Recipe',
            description: 'test description',
            image: '/path/to/test.png',
            ingredients: ['ingredients', 'list'],
            method: ['list', 'of', 'steps'],
            id: 0,
            user: 0,
        });
    });
});

describe('Database editRecipe method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.editRecipe(
                0,
                'new-title',
                'new-description',
                ['new-ingredient'],
                ['new-method-step'],
                null,
            );
        }).toThrow('Database not initialized.');
    });

    it('Should edit the recipe in the datastore recipes object', () => {
        let datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = {
            next_ids: {
                user: 2,
                recipe: 2,
            },
        };

        datastore.recipes = [{
            recipe_id: 0,
            upstream: null,
            title: 'First Recipe',
            description: '',
            photo: null,
            ingredients: [],
            method: [],
            owner_id: 0,
            bakes: [],
        }];

        expect(datastore.editRecipe(
            0,
            'new-title',
            'new-description',
            ['new-ingredient'],
            ['new-method-step'],
            '/path/to/test.png',
        ))
            .toBe(true);

        expect(datastore.recipes)
            .toStrictEqual([
                {
                    recipe_id: 0,
                    upstream: null,
                    title: 'new-title',
                    description: 'new-description',
                    photo: '/path/to/test.png',
                    ingredients: ['new-ingredient'],
                    method: ['new-method-step'],
                    owner_id: 0,
                    bakes: [],
                },
            ]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.recipes)
            .toStrictEqual([
                {
                    recipe_id: 0,
                    upstream: null,
                    title: 'new-title',
                    description: 'new-description',
                    photo: '/path/to/test.png',
                    ingredients: ['new-ingredient'],
                    method: ['new-method-step'],
                    owner_id: 0,
                    bakes: [],
                },
            ]);
    });

    it('Should sanitise any html', () => {
        let datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = {
            next_ids: {
                user: 2,
                recipe: 2,
            },
        };

        datastore.recipes = [{
            recipe_id: 0,
            upstream: null,
            title: 'First Recipe',
            description: '',
            photo: null,
            ingredients: [],
            method: [],
            owner_id: 0,
            bakes: [],
        }];

        expect(datastore.editRecipe(
            0,
            'new-title',
            '<script>malicious_function()</script>',
            ['new-ingredient'],
            ['new-method-step'],
            '/path/to/test.png',
        ))
            .toBe(true);

        expect(datastore.recipes)
            .toStrictEqual([
                {
                    recipe_id: 0,
                    upstream: null,
                    title: 'new-title',
                    description: '',
                    photo: '/path/to/test.png',
                    ingredients: ['new-ingredient'],
                    method: ['new-method-step'],
                    owner_id: 0,
                    bakes: [],
                },
            ]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.recipes)
            .toStrictEqual([
                {
                    recipe_id: 0,
                    upstream: null,
                    title: 'new-title',
                    description: '',
                    photo: '/path/to/test.png',
                    ingredients: ['new-ingredient'],
                    method: ['new-method-step'],
                    owner_id: 0,
                    bakes: [],
                },
            ]);
    });
});

describe('Database deleteRecipe method', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new db.Datastore(getCurrentTestDir());
        datastore.close();

        await expect(() => {
            datastore.deleteRecipe(0);
        }).toThrow('Database not initialized.');
    });

    it('Should delete the recipe in the datastore recipes object', () => {
        let datastore = new db.Datastore(getCurrentTestDir());
        datastore.meta = { next_ids: { user: 2, recipe: 2 } };

        datastore.recipes = [{
            recipe_id: 0,
            upstream: null,
            title: 'First Recipe',
            description: '',
            photo: null,
            ingredients: [],
            method: [],
            owner_id: 0,
            bakes: [],
        }];

        expect(datastore.deleteRecipe(0)).toBe(true);

        expect(datastore.recipes).toStrictEqual([]);

        // Check file has been updated
        datastore.close();
        datastore = new db.Datastore(getCurrentTestDir());

        datastore.load();
        expect(datastore.recipes).toStrictEqual([]);
    });
});
