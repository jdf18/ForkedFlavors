window.getCurrentRecipeId = function () {
    const url = window.location.href;
    const numStr = url.substring(url.lastIndexOf('/') + 1);
    let recipeId = 0;
    for (let i = 0; i < numStr.length; i++) {
        if (numStr[i] < '0' || numStr[i] > '9') {
            break;
        }
        recipeId *= 10;
        recipeId += Number(numStr[i]);
    }
    return recipeId;
};

async function tryApiGetReturnJson(endpoint) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            return result;
        }
        console.log(`Error: ${result.message}`);
        return response.statusCode;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
}

async function tryApiPostJsonReturnJson(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            return result;
        }
        console.log(`Error: ${result.message}`);
        return response.statusCode;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
}

window.apiLogin = async function (username, password) {
    return tryApiPostJsonReturnJson('auth/login', { username, password });
};

window.apiLogout = async function () {
    return tryApiGetReturnJson('auth/logout');
};

window.apiIsLoggedIn = async function () {
    return tryApiGetReturnJson('auth/is_auth');
};

window.apiSignup = async function (username, password) {
    return tryApiPostJsonReturnJson('profile/create', { username, password });
};

window.apiDeleteAccount = async function () {
    return tryApiGetReturnJson('profile/delete');
};

window.apiGetSelfProfile = async function () {
    return tryApiGetReturnJson('profile/get');
};

window.apiGetProfile = async function (username) {
    return tryApiPostJsonReturnJson('profile/get_username', { username });
};
window.apiGetProfileLegacy = async function (username) {
    return tryApiGetReturnJson(`profile/get/${username}`);
};

window.apiModifyProfile = async function (displayName, bio) {
    return tryApiPostJsonReturnJson('profile/modify', { displayName, bio });
};

window.apiGetRecipes = async function () {
    return tryApiGetReturnJson('recipes/get');
};

window.apiGetRecipe = async function () {
    const recipeId = window.getCurrentRecipeId();
    return tryApiPostJsonReturnJson('recipe/get', { recipeId });
};
window.apiGetRecipeLegacy = async function () {
    const recipeId = window.getCurrentRecipeId();
    return tryApiGetReturnJson(`recipe/get/${recipeId}`);
};

window.apiCreateRecipe = async function () {
    return tryApiGetReturnJson('recipe/create');
};

window.apiForkRecipe = async function (forkId) {
    return tryApiPostJsonReturnJson('recipe/fork', { forkRecipeId: forkId });
};

window.apiEditRecipe = async function (data) {
    const recipeId = window.getCurrentRecipeId();
    return tryApiPostJsonReturnJson('recipe/edit', { recipeId, updatedContent: data });
};
