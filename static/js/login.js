/* global bootstrap */

window.openSignup = function () {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    loginModal.hide();
    signupModal.show();
};

window.initLogin = async function () {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));

    document.getElementById('loginBtn').addEventListener('click', () => {
        loginModal.show();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await window.apiLogout();

        await window.updateNavbar();
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        await window.apiLogin(username, password);

        loginModal.hide();
        await window.updateNavbar();
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        await window.apiSignup(username, password);
        await window.apiLogin(username, password);
        signupModal.hide();
        loginModal.hide();
        await window.updateNavbar();
    });
};
// document.addEventListener('DOMContentLoaded', window.initLogin);
