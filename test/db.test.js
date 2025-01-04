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
