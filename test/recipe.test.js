jest.mock('../src/db', () => {
    return {
        Datastore: jest.fn().mockImplementation(() => ({
            getUserFromUsername: jest.fn(),
            saveRecipe: jest.fn(),
            editRecipe: jest.fn(),
            getRecipe: jest.fn(),
            getRecipeById: jest.fn(),
            createEmptyRecipe: jest.fn(),
            forkRecipe: jest.fn(),
            close: jest.fn(),
            save: jest.fn(),
            initialised: false,
            recipes: [
                {
                    recipe_id: 0,
                    upstream: null,
                    title: 'First Recipe',
                    description: 'recipe 0',
                    photo: null,
                    ingredients: [],
                    method: [],
                    owner_id: 0,
                    bakes: [],
                },
                {
                    recipe_id: 1,
                    upstream: null,
                    title: 'Untitled Recipe',
                    description: 'recipe 1',
                    photo: null,
                    ingredients: ['first', 'ingredient'],
                    method: ['beginning', 'step'],
                    owner_id: 0,
                    bakes: [],
                },
            ],
        })),
    };
});

const { Datastore } = require('../src/db'); // Mocked class
const recipe = require('../src/recipe');

const path = require('path');
const fs = require('fs');
const db = require('../src/db'); // The wrapper being tested

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

describe('Recipe createNewRecipe function', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;
        datastore.close();
        datastore.initialised = false;

        datastore.createEmptyRecipe.mockRejectedValue(new Error('Database not initialized.'));

        await expect(recipe.createNewRecipe(datastore, 0)).rejects.toThrow('Database not initialized.');

        expect(datastore.createEmptyRecipe).toHaveBeenCalledWith(0);
    });

    it('Should create a new recipe in the datastore', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;

        datastore.createEmptyRecipe.mockResolvedValue(1);

        const result = await recipe.createNewRecipe(datastore, 0);
        expect(result).toBe(1);

        expect(datastore.createEmptyRecipe).toHaveBeenCalledWith(0);
    });
});

describe('Recipe forkRecipe function', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should create a new recipe in the datastore recipe object', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;

        datastore.createEmptyRecipe.mockImplementation((userId) => {
            const newId = 2;
            datastore.recipes.push({
                recipe_id: newId,
                upstream: null,
                title: 'Untitled Recipe',
                description: '',
                photo: null,
                ingredients: [],
                method: [],
                owner_id: userId,
                bakes: [],
            });
            return newId;
        });

        const result = await recipe.forkRecipe(datastore, 0, 1);
        expect(result).toBe(2);

        expect(datastore.createEmptyRecipe).toHaveBeenCalledWith(0);
        const index = datastore.recipes.findIndex((r) => r.recipe_id === 2);
        expect(index).not.toBe(-1);
        expect(datastore.recipes[index]).toBeDefined();

        const forkIndex = datastore.recipes.findIndex((r) => r.recipe_id === 1);
        expect(index).not.toBe(-1);

        expect(datastore.recipes[index].upstream).toBe(1);
        expect(datastore.recipes[index].title).toBe('Untitled Recipe');
        expect(datastore.recipes[index].description).toBe('');
        expect(datastore.recipes[index].photo).toBe(null);
        expect(datastore.recipes[index].ingredients).toBe(
            datastore.recipes[forkIndex].ingredients,
        );
        expect(datastore.recipes[index].method).toBe(
            datastore.recipes[forkIndex].method,
        );
        expect(datastore.recipes[index].owner_id).toBe(0);

        expect(datastore.save).toHaveBeenCalledWith();
    });
});

describe('Recipe editRecipe function', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;
        datastore.close();
        datastore.initialised = false;

        expect(() => recipe.editRecipe(datastore, 0, {})).toThrow('Database not initialized.');
    });

    it('Should edit the recipe in the datastore', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;

        datastore.editRecipe.mockResolvedValue(true);

        const result = recipe.editRecipe(datastore, 0, {
            EditableRecipeTitle: 'new-title',
            EditableDescription: 'new-description',
            EditableIngredient1: 'new-ingredient',
            EditableIngredient2: 'other-new-ingredient',
            EditableMethod1: 'new-method-step',
            EditableMethod2: 'other-new-method-step',
            EditablePhotoUrl: null,
        });
        expect(result).toBe(true);

        expect(datastore.editRecipe).toHaveBeenCalledWith(
            0,
            'new-title',
            'new-description',
            ['new-ingredient', 'other-new-ingredient'],
            ['new-method-step', 'other-new-method-step'],
            null,
        );
    });
});

describe('Recipe getRecipe function', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;
        datastore.close();
        datastore.initialised = false;

        datastore.getRecipe.mockRejectedValue(new Error('Database not initialized.'));

        await expect(recipe.getRecipe(datastore, 0)).rejects.toThrow('Database not initialized.');

        expect(datastore.getRecipe).toHaveBeenCalledWith(0);
    });

    it('Should get a recipe from the datastore', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;

        datastore.getRecipe.mockResolvedValue({ data: 'some-data' });

        const result = await recipe.getRecipe(datastore, 0);
        expect(result).toEqual({ data: 'some-data' });

        expect(datastore.getRecipe).toHaveBeenCalledWith(0);
    });
});

describe('Recipe getRecipes function', () => {
    beforeEach(createTestDir);
    afterAll(cleanTestDir);

    it('Should error when not connected to database', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;
        datastore.close();
        datastore.initialised = false;

        expect(() => recipe.getRecipes(datastore)).toThrow('Database not initialized.');
    });

    it('Should get a list of all recipes details from the datastore', async () => {
        const datastore = new Datastore(getCurrentTestDir());
        datastore.initialised = true;

        datastore.getRecipe.mockImplementation((recipeId) => {
            const index = datastore.recipes.findIndex((r) => r.recipe_id === recipeId);
            if (index === -1) return false;

            return {
                id: datastore.recipes[index].recipe_id,
                title: datastore.recipes[index].title,
                description: datastore.recipes[index].description,
                ingredients: datastore.recipes[index].ingredients,
                method: datastore.recipes[index].method,
                image: (datastore.recipes[index].photo === null) ? '/img/header-background.jpg' : datastore.recipes[index].photo,
                upstream: datastore.recipes[index].upstream,
                user: datastore.recipes[index].owner_id,
            };
        });

        const result = await recipe.getRecipes(datastore, 0);
        expect(result).toEqual([
            {
                id: 0,
                upstream: null,
                title: 'First Recipe',
                description: 'recipe 0',
                image: '/img/header-background.jpg',
                ingredients: [],
                method: [],
                user: 0,
            },
            {
                id: 1,
                upstream: null,
                title: 'Untitled Recipe',
                description: 'recipe 1',
                image: '/img/header-background.jpg',
                ingredients: ['first', 'ingredient'],
                method: ['beginning', 'step'],
                user: 0,
            },
        ]);

        expect(datastore.getRecipe).toHaveBeenCalledWith(0);
        expect(datastore.getRecipe).toHaveBeenCalledWith(1);
    });
});
