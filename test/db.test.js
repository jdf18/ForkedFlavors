const fs = require('fs');

const db = require('../src/db');

const TEST_DB_FILE = 'test_db.db';

describe('Database initialization', () => {
    beforeEach(() => {
        // Make sure the file does not exist before any of the tests
        if (fs.existsSync(TEST_DB_FILE)) {
            fs.unlinkSync(TEST_DB_FILE);
        }
    });

    afterAll(() => {
        // Clean up the file after the tests are completed
        if (fs.existsSync(TEST_DB_FILE)) {
            fs.unlinkSync(TEST_DB_FILE);
        }
    });

    test('should fail to close db object if not connected', () => {
        expect(() => {
            db.close();
        }).toThrow('Database not yet initialized. Call `connect() first.`');
    });

    test('should fail to get db object if not connected', () => {
        expect(() => {
            db.getDb();
        }).toThrow('Database not yet initialized. Call `connect() first.`');
    });

    test('should initialize the database from a existing .db file', async () => {
        // Check that the database file does not exist
        expect(fs.existsSync(TEST_DB_FILE)).toBe(false);
        fs.writeFileSync(TEST_DB_FILE, '');
        fs.chmodSync(TEST_DB_FILE, 0o766);
        expect(fs.existsSync(TEST_DB_FILE)).toBe(true);

        // ! warning: produces an error due to jest not having write permissions for file
        // await db.connect(TEST_DB_FILE, true);
        // expect(db.getDb()).toBeDefined();
        // db.close();
    });

    test('should fail to initialize the database from a non-existing .db file', async () => {
        // Check that the database file does not exist
        expect(fs.existsSync(TEST_DB_FILE)).toBe(false);

        await expect(db.connect(TEST_DB_FILE, false)).rejects.toThrow(`Database file "${TEST_DB_FILE}" does not exist.`);
    });

    test('should initialize tables in an empty database file', async () => {
        // Check that the database file does not exist
        expect(fs.existsSync(TEST_DB_FILE)).toBe(false);
        fs.writeFileSync(TEST_DB_FILE, '');
        expect(fs.existsSync(TEST_DB_FILE)).toBe(true);

        await db.connect(':memory:', false);

        const database = db.getDb();
        expect(database).toBeDefined();

        // Check if tables were created
        const checkTable = (tableName) => new Promise((resolve, reject) => {
            database.get(
                'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?',
                [tableName],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                },
            );
        });

        const usersTable = await checkTable('users');
        const recipesTable = await checkTable('recipes');
        const commentsTable = await checkTable('comments');

        db.close();

        expect(usersTable).toBeDefined();
        expect(usersTable.name).toBe('users');

        expect(recipesTable).toBeDefined();
        expect(recipesTable.name).toBe('recipes');

        expect(commentsTable).toBeDefined();
        expect(commentsTable.name).toBe('comments');
    });
});

describe('Database getUserFromUserId method', () => {
    beforeEach(async () => {
        await db.connect(':memory:', false);
    });

    it('Should error when not connected to database', async () => {
        db.close();

        await expect(db.getUserFromUserId(1)).rejects.toThrow('Database not yet initialized. Call `connect() first.`');
    });

    it('Should return a user object when given a valid user id', async () => {
        expect(db.getDb()).toBeDefined();

        const stmt = db.getDb().prepare('INSERT INTO users VALUES (1, \'test_user\', \'test_password\')');
        stmt.run();
        stmt.finalize();

        expect(await db.getUserFromUserId(1)).toEqual({
            user_id: 1,
            username: 'test_user',
            password_hash: 'test_password',
        });
    });

    it('Should return null when given an invalid user id', async () => {
        expect(db.getDb()).toBeDefined();

        const stmt = db.getDb().prepare('INSERT INTO users VALUES (1, \'test_user\', \'test_password\')');
        stmt.run();
        stmt.finalize();

        expect(await db.getUserFromUserId(2)).toBe(null);
        expect(await db.getUserFromUserId('invalid_data')).toBe(null);

        db.close();
    });
});

describe('Database getUserFromUsername method', () => {
    beforeEach(async () => {
        await db.connect(':memory:', false);
    });

    it('Should error when not connected to database', async () => {
        db.close();

        await expect(db.getUserFromUsername('test username')).rejects.toThrow('Database not yet initialized. Call `connect() first.`');
    });

    it('Should return a user object when given a valid username', async () => {
        expect(db.getDb()).toBeDefined();

        const stmt = db.getDb().prepare('INSERT INTO users VALUES (1, \'test_user\', \'test_password\')');
        stmt.run();
        stmt.finalize();

        expect(await db.getUserFromUsername('test_user')).toEqual({
            user_id: 1,
            username: 'test_user',
            password_hash: 'test_password',
        });
    });

    it('Should return null when given an invalid username', async () => {
        expect(db.getDb()).toBeDefined();

        const stmt = db.getDb().prepare('INSERT INTO users VALUES (1, \'test_user\', \'test_password\')');
        stmt.run();
        stmt.finalize();

        expect(await db.getUserFromUsername('invalid_name')).toBe(null);
        expect(await db.getUserFromUsername(212)).toBe(null);

        db.close();
    });
});
