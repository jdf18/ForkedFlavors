async function createNewRecipe(e) {
    e.preventDefault();

    const recipeId = await window.apiCreateRecipe();
    window.location.href = `/recipe/${recipeId}`;
}

window.updateNavbar = async function () {
    const isLoggedIn = await window.apiIsLoggedIn();

    if (isLoggedIn) {
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');

        const loginOnlyLinks = document.querySelectorAll('.nav-login-only');
        loginOnlyLinks.forEach((link) => {
            link.classList.remove('disabled');
        });

        const createNewButton = document.getElementById('create-new-recipe');
        createNewButton.addEventListener('click', window.createNewRecipe);

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
        createNewButton.removeEventListener('click', window.createNewRecipe);

        document.getElementById('nav-my-recipes').children[0].href = '#';
        document.getElementById('nav-my-account').children[0].href = '#';
    }
};

window.initNavbar = async function () {
    await window.updateNavbar();
};
// document.addEventListener('DOMContentLoaded', window.initNavbar);
