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

window.apiGetRecipes = async function () {
    try {
        const response = await fetch('/api/recipes', {
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
        return null;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
};

window.apiIsLoggedIn = async function () {
    try {
        const response = await fetch('/api/is_logged_in', {
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
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return false;
};

window.apiLogin = async function (username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`Welcome, ${result.username}!`);
        } else {
            console.log(`Error: ${result.message}`);
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
};

window.apiLogout = async function () {
    let result;
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        result = await response.json();

        if (response.ok) {
            return true;
        }
        console.log(`Error: ${result.message}`);
        return false;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
        return false;
    }
};

window.apiSignup = async function (username, password) {
    try {
        const response = await fetch('/api/create_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`Welcome, ${result.username}!`);
        } else {
            console.log(`Error: ${result.message}`);
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
};

window.apiGetRecipe = async function () {
    const recipeId = window.getCurrentRecipeId();

    try {
        const response = await fetch(`/api/recipe/${recipeId}`, {
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
        return null;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
};

window.apiCreateRecipe = async function () {
    try {
        const response = await fetch('/api/new_recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Recipe created');
            return result;
        }
        console.log(`Error: ${result.message}`);
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
};

window.apiEditRecipe = async function (data) {
    const recipeId = window.getCurrentRecipeId();

    try {
        const response = await fetch('/api/edit_recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipeId,
                updatedContent: data,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Recipe edited');
            return result;
        }
        console.log(`Error: ${result.message}`);
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
    return null;
};

window.apiGetProfile = async function (username) {
    try {
        const response = await fetch(`/api/profile/${username}`, {
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
        return null;
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
        return null;
    }
};

window.apiModifyProfile = async function (displayName, bio) {
    try {
        const response = await fetch('/api/modify_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ displayName, bio }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`Welcome, ${result.username}!`);
        } else {
            console.log(`Error: ${result.message}`);
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
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
