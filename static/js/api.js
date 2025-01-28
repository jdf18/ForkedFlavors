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
        const response = await fetch('/api/login', {
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

window.apiGetRecipes = async function () {
    return tryApiGetReturnJson('recipes');
};

window.apiIsLoggedIn = async function () {
    return tryApiGetReturnJson('is_logged_in');
};

window.apiLogin = async function (username, password) {
    return tryApiPostJsonReturnJson('login', { username, password });
};

window.apiLogout = async function () {
    return tryApiGetReturnJson('logout');
};

window.apiSignup = async function (username, password) {
    return tryApiPostJsonReturnJson('create_account', { username, password });
};

window.apiGetRecipe = async function () {
    const recipeId = window.getCurrentRecipeId();
    return tryApiGetReturnJson(`recipe/${recipeId}`);
};

window.apiCreateRecipe = async function () {
    return tryApiGetReturnJson('new_recipe');
};

window.apiEditRecipe = async function (data) {
    const recipeId = window.getCurrentRecipeId();
    return tryApiPostJsonReturnJson('edit_recipe', { recipeId, updatedContent: data });
};

window.apiGetProfile = async function (username) {
    return tryApiGetReturnJson(`profile/${username}`);
};

window.apiModifyProfile = async function (displayName, bio) {
    return tryApiPostJsonReturnJson('modify_profile', { displayName, bio });
};

window.apiDeleteAccount = async function () {
    try {
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Account deleted');
        } else {
            console.log(`Error: ${result.message}`);
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
};
