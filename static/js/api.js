window.getCurrentUsername = function () {
    const url = window.location.href;
    return url.substring(url.lastIndexOf('/') + 1);
};

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
        console.log(`${endpoint}: Something went wrong. Please try again.`);
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
        console.log(`Error: ${endpoint}: ${result.message}`);
        return response.statusCode;
    } catch (error) {
        console.log(`${endpoint}: Something went wrong. Please try again.`);
        console.error(error);
    }
    return null;
}

window.apiLogin = async function (username, password) {
    return await tryApiPostJsonReturnJson('auth/login', { username, password });
};

window.apiLogout = async function () {
    return await tryApiGetReturnJson('auth/logout');
};

window.apiIsLoggedIn = async function () {
    return await tryApiGetReturnJson('auth/is_auth');
};

window.apiSignup = async function (username, password) {
    return await tryApiPostJsonReturnJson('profile/create', { username, password });
};

window.apiDeleteAccount = async function () {
    return await tryApiGetReturnJson('profile/delete');
};

window.apiGetSelfProfile = async function () {
    return await tryApiGetReturnJson('profile/get');
};

window.apiGetProfile = async function (username) {
    return await tryApiPostJsonReturnJson('profile/get_by_username', { username });
};
window.apiGetProfileLegacy = async function (username) {
    return await tryApiGetReturnJson(`profile/get/${username}`);
};

window.apiGetProfileById = async function (accountId) {
    return await tryApiPostJsonReturnJson('profile/get_by_id', { accountId });
};

window.apiModifyProfile = async function (displayName, bio) {
    return await tryApiPostJsonReturnJson('profile/modify', { displayName, bio });
};

window.apiGetRecipes = async function () {
    return await tryApiGetReturnJson('recipes/get');
};

window.apiGetRecipe = async function (recipeId) {
    return await tryApiPostJsonReturnJson('recipe/get', { recipeId });
};
window.apiGetCurrentRecipe = async function () {
    const recipeId = window.getCurrentRecipeId();
    return await tryApiPostJsonReturnJson('recipe/get', { recipeId });
};
window.apiGetRecipeLegacy = async function () {
    const recipeId = window.getCurrentRecipeId();
    return await tryApiGetReturnJson(`recipe/get/${recipeId}`);
};

window.apiCreateRecipe = async function () {
    return await tryApiGetReturnJson('recipe/create');
};

window.apiForkRecipe = async function (forkId) {
    return await tryApiPostJsonReturnJson('recipe/fork', { forkRecipeId: forkId });
};

window.apiEditRecipe = async function (data) {
    const recipeId = window.getCurrentRecipeId();
    return await tryApiPostJsonReturnJson('recipe/edit', { recipeId, updatedContent: data });
};

window.apiDeleteCurrentRecipe = async function () {
    const recipeId = window.getCurrentRecipeId();
    return await tryApiPostJsonReturnJson('recipe/delete', { recipeId });
};
