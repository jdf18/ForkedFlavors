window.displayRecipes = function (recipes) {
    const recipeContainer = document.getElementById('recipes-container');
    recipeContainer.innerHTML = '';

    recipes.forEach((recipe) => {
        const card = document.createElement('div');
        card.classList.add('col');
        card.innerHTML = `
            <a href="/recipe/${recipe.id}" class="col-md-4 mb-4 text-decoration-none text-reset">
                <div class="card h-100">
                    <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                    <div class="card-body">
                        <h5 class="card-title">${recipe.title}</h5>
                        <p class="card-text">${recipe.description}</p>
                    </div>
                </div>
            </a>`;
        recipeContainer.appendChild(card);
    });
};

window.initRecipes = async function () {
    const allRecipes = await window.apiGetRecipes();
    window.displayRecipes(allRecipes);

    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredRecipes = allRecipes.filter((recipe) => {
            return recipe.title.toLowerCase().includes(query);
            // || recipe.description.toLowerCase().includes(query);
        });

        window.displayRecipes(filteredRecipes);
    });
};
// document.addEventListener('DOMContentLoaded', window.initRecipes);
