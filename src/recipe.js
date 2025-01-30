function createNewRecipe(datastore, userId) {
    return datastore.createEmptyRecipe(userId);
}

function forkRecipe(datastore, userId, forkId) {
    if (!datastore.initialised) {
        throw new Error('Database not initialized.');
    }

    const recipeId = createNewRecipe(datastore, userId);

    const index = datastore.recipes.findIndex((recipe) => recipe.recipe_id === recipeId);
    if (index === -1) return false;

    const forkIndex = datastore.recipes.findIndex((recipe) => recipe.recipe_id === forkId);
    if (index === -1) return false;

    datastore.recipes[index].upstream = forkId;
    datastore.recipes[index].ingredients = datastore.recipes[forkIndex].ingredients;
    datastore.recipes[index].method = datastore.recipes[forkIndex].method;
    datastore.save();

    return recipeId;
}

function editRecipe(datastore, recipeId, newContent) {
    if (!datastore.initialised) {
        throw new Error('Database not initialized.');
    }

    const title = newContent.EditableRecipeTitle;
    const description = newContent.EditableDescription;
    const photo = newContent.EditablePhotoUrl;

    const ingredients = [];
    const method = [];

    // ! Not actually checking the order here and instead going off of order defined in object
    // todo: make this actaully robust
    for (const [key, value] of Object.entries(newContent)) {
        if (key.includes('Ingredient')) {
            ingredients.push(value);
        } else if (key.includes('Method')) {
            method.push(value);
        }
    }

    datastore.editRecipe(recipeId, title, description, ingredients, method, photo);

    return true;
}

// function getBakeImages() {
//
// }

function getRecipe(datastore, recipeId) {
    // getBakeImages();
    return datastore.getRecipe(recipeId);
}

function getRecipes(datastore) {
    if (!datastore.initialised) {
        throw new Error('Database not initialized.');
    }

    const ids = datastore.recipes.map((recipe) => recipe.recipe_id);
    return ids.map((recipeId) => getRecipe(datastore, recipeId));
}

// function addBakeImage() {
//
// }
//
// function logBake() {
//     addBakeImage();
// }

module.exports = {
    createNewRecipe,
    forkRecipe,
    editRecipe,
    getRecipe,
    getRecipes,
    // logBake,
};
