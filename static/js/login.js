/* global bootstrap */

async function apiIsLoggedIn() {
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
}

async function apiLogin(username, password) {
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
}

async function apiLogout() {
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
}

async function apiSignup(username, password) {
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
}

function openSignup() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    loginModal.hide();
    signupModal.show();
}

async function createNewRecipe(e) {
    e.preventDefault();

    const recipeId = await apiCreateRecipe();
    window.location.href = `/recipe/${recipeId}`;
}

async function updateNavbar() {
    const isLoggedIn = await apiIsLoggedIn();

    if (isLoggedIn) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');

        const loginOnlyLinks = document.querySelectorAll('.nav-login-only');
        loginOnlyLinks.forEach((link) => {
            link.classList.remove('disabled');
        });

        const createNewButton = document.getElementById('create-new-recipe');
        createNewButton.addEventListener('click', createNewRecipe);

        document.getElementById('nav-my-recipes').children[0].href = '/recipes';
        document.getElementById('nav-my-account').children[0].href = '/account';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath !== '/') {
            window.location.href = '/';
        }

        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');

        const loginOnlyLinks = document.querySelectorAll('.nav-login-only');
        loginOnlyLinks.forEach((link) => {
            link.classList.add('disabled');
        });

        const createNewButton = document.getElementById('create-new-recipe');
        createNewButton.removeEventListener('click', createNewRecipe);

        document.getElementById('nav-my-recipes').children[0].href = '#';
        document.getElementById('nav-my-account').children[0].href = '#';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await updateNavbar();

    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));

    document.getElementById('loginBtn').addEventListener('click', () => {
        loginModal.show();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await apiLogout();

        await updateNavbar();
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        await apiLogin(username, password);

        loginModal.hide();
        await updateNavbar();
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        await apiSignup(username, password);
        await apiLogin(username, password);
        signupModal.hide();
        loginModal.hide();
        await updateNavbar();
    });
});
