function showApiStatusMessage(message, isError = true) {
    const messageBox = document.getElementById('api-status-message');
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.style.backgroundColor = isError ? 'rgba(200, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.8)';
}

function hideApiStatusMessage() {
    const messageBox = document.getElementById('api-status-message');
    if (messageBox) messageBox.style.display = 'none';
}

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

const maxRetries = 10;
const startDelay = 1000;
const delayMultiplier = 2;

async function tryApiGetReturnJson(endpoint, maxTries = maxRetries) {
    let delay = startDelay;
    for (let attempt = 0; attempt <= maxTries; attempt++) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                hideApiStatusMessage();
                return result;
            }
            showApiStatusMessage(`API Error: ${result.message}`);
            console.log(`Error: ${result.message}`);
            return response.statusCode;
        } catch (error) {
            console.log(`${endpoint}: Attempt ${attempt + 1}: Something went wrong. Please try again.`);
            console.error(error);
            showApiStatusMessage(`Failed to contact server: Attempt ${attempt}...`);
            if (attempt <= maxTries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= delayMultiplier;
            }
        }
    }
    showApiStatusMessage('Failed to reconnect to server: Try again later');
    console.log(`${endpoint}: All ${maxTries} retry attempts failed.`);
    return null;
}

async function tryApiPostJsonReturnJson(endpoint, data, maxTries = maxRetries) {
    let delay = startDelay;
    for (let attempt = 0; attempt <= maxTries; attempt++) {
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
                hideApiStatusMessage();
                return result;
            }
            showApiStatusMessage(`API Error: ${result.message}`);
            console.log(`Error: ${endpoint}: ${result.message}`);
            return response.statusCode;
        } catch (error) {
            console.log(`${endpoint}: Something went wrong. Please try again.`);
            console.error(error);
            showApiStatusMessage(`Failed to contact server: Attempt ${attempt}...`);
            if (attempt <= maxTries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= delayMultiplier;
            }
        }
    }
    showApiStatusMessage('Failed to reconnect to server: Try again later');
    console.log(`${endpoint}: All ${maxTries} retry attempts failed.`);
    return null;
}

window.apiLogin = async function (username, password) {
    localStorage.setItem('logged_in', 'true');
    return await tryApiPostJsonReturnJson('auth/login', { username, password });
};

window.apiLogout = async function () {
    localStorage.setItem('logged_in', 'false');
    return await tryApiGetReturnJson('auth/logout');
};

window.apiIsLoggedIn = async function () {
    const result = await tryApiGetReturnJson('auth/is_auth', 1);
    if (result === null) {
        console.log('API endpoint is_logged_in failed so using cached value');
        return localStorage.getItem('logged_in') === 'true';
    }
    localStorage.setItem('logged_in', result ? 'true' : 'false');
    return result;
};

window.apiSignup = async function (username, password) {
    return await tryApiPostJsonReturnJson('profile/create', { username, password });
};

window.apiDeleteAccount = async function () {
    localStorage.setItem('logged_in', 'false');
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
