window.initIndex = function () {
    const viewRecipesBtn = document.getElementById('view-recipes-btn');
    const createAccountBtn = document.getElementById('create-account-btn');

    viewRecipesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/recipes';
    });

    createAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();

        window.openSignup();
    });
};
