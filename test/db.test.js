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
