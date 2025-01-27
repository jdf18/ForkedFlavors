function createNewRecipe(datastore, userId) {
    return datastore.createEmptyRecipe(userId);
}

function forkRecipe(datastore, userId, forkId) {
    const recipeId = createNewRecipe(datastore, userId);

    const index = datastore.recipes.findIndex((recipe) => recipe.recipe_id === recipeId);
    if (index === -1) return false;

    datastore.recipes[index].upstream = forkId;
    datastore.save();

    return recipeId;
}

function editRecipe(datastore, recipeId, newContent) {
    const title = newContent.EditableRecipeTitle;

    const ingredients = [];
    const method = [];

    // ! Not actually checking the order here and instead going off of order defined in object
    // todo: make this actaully robust
    // ! Not checking html submitted. Especially for script tags. This should be plain text only
    // todo: Fix this ^
    for (const [key, value] of Object.entries(newContent)) {
        if (key.includes('Ingredient')) {
            ingredients.push(value);
        } else if (key.includes('Method')) {
            method.push(value);
        }
    }

    datastore.editRecipe(recipeId, title, ingredients, method);
}

function getBakeImages() {

}

function getRecipe(datastore, recipeId) {
    getBakeImages();
    const recipe = datastore.getRecipe(recipeId);
    return recipe;
}

function addBakeImage() {

}

function logBake() {
    addBakeImage();
}

module.exports = {
    createNewRecipe,
    forkRecipe,
    editRecipe,
    getRecipe,
    logBake,
};
