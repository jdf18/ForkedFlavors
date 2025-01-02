/* global bootstrap */

document.addEventListener('DOMContentLoaded', () => {
    const loginModal = new bootstrap.Modal(document.getElementById('myModal'));

    document.getElementById('loginBtn').addEventListener('click', () => {
        loginModal.show();
    });
});
