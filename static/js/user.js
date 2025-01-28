/* global bootstrap */

async function updateUserProfile() {
    const username = window.getCurrentUsername();
    const userData = await window.apiGetProfile(username);

    if (userData == null) return;

    const recipes = await window.apiGetRecipes();

    document.getElementById('account-display-name').innerText = userData.displayName;
    document.getElementById('account-bio').innerText = userData.bio;
    if (userData.pfpLink === undefined) {
        document.getElementById('account-pfp').src = '/img/placeholder-pfp.png';
    } else {
        document.getElementById('account-pfp').src = userData.pfpLink;
    }
    const usersRecipes = recipes.filter((recipe) => {
        return (recipe.user === userData.id);
    });
    window.displayRecipes(usersRecipes);
}

window.initUser = async function () {
    await updateUserProfile();
};
// document.addEventListener('DOMContentLoaded', window.initUser);
