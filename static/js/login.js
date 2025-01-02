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

async function updateNavbar() {
    const isLoggedIn = await apiIsLoggedIn();

    if (isLoggedIn) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');

        document.getElementById('nav-my-recipes').children[0].classList.remove('disabled');
        document.getElementById('nav-my-recipes').children[0].href = '/recipes';
        document.getElementById('nav-my-account').children[0].classList.remove('disabled');
        document.getElementById('nav-my-account').children[0].href = '/account';
    } else {
        const currentPath = window.location.pathname;
        if (currentPath !== '/') {
            window.location.href = '/';
        }

        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');

        document.getElementById('nav-my-recipes').children[0].classList.add('disabled');
        document.getElementById('nav-my-recipes').children[0].href = '#';
        document.getElementById('nav-my-account').children[0].classList.add('disabled');
        document.getElementById('nav-my-account').children[0].href = '#';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await updateNavbar();

    const loginModal = new bootstrap.Modal(document.getElementById('myModal'));

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
});
