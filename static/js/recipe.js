async function apiGetRecipe() {
    const url = window.location.href;
    const recipeId = Number(url.substring(url.lastIndexOf('/') + 1));

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
}

async function apiCreateRecipe() {
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
}

async function apiEditRecipe(data) {
    const url = window.location.href;
    const recipeId = Number(url.substring(url.lastIndexOf('/') + 1));

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
}

async function loadRecipeData() {
    const recipeData = await apiGetRecipe();

    const title = document.getElementById('EditableRecipeTitle');
    title.innerText = recipeData.title;


    const ingredientsList = document.getElementById(`ingredients-list`);
    if (!ingredientsList) {
        console.error(`Idk it broke and it should not have`);
        return;
    }

    ingredientsList.innerHTML = '';

    recipeData.ingredients.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.className = 'list-group-item editable';
        li.setAttribute('contenteditable', 'false');
        li.id = `EditableIngredient${index + 1}`;
        ingredientsList.appendChild(li);
    })


    const methodList = document.getElementById(`method-list`);
    if (!methodList) {
        console.error(`Idk it broke and it should not have`);
        return;
    }

    methodList.innerHTML = '';

    recipeData.method.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.className = 'list-group-item editable';
        li.setAttribute('contenteditable', 'false');
        li.id = `EditableMethod${index + 1}`;
        methodList.appendChild(li);
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    const methodSteps = document.querySelectorAll('.method li.list-group-item');

    methodSteps.forEach((methodStep) => {
        methodStep.addEventListener('click', (e) => {
            methodSteps.forEach((step) => step.classList.remove('active-step'));
            methodStep.classList.add('active-step');
        });
    });

    const createNewButton = document.getElementById('create-new-btn');

    createNewButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const recipeId = await apiCreateRecipe();

        window.location.href = `/recipe/${recipeId}`;
    });

    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');

    const editButtonGroup = document.getElementById('contentEditButtons');

    let originalValues = {};

    // Enable edit mode
    editButton.addEventListener('click', (e) => {
        const editableElements = document.querySelectorAll('.editable');
        originalValues = {};
        editableElements.forEach((el) => {
            originalValues[el.id] = el.innerHTML;
            el.contentEditable = 'true';
            el.classList.add('border');
        });

        editButton.classList.add('d-none');
        editButtonGroup.classList.remove('d-none');
    });

    // Cancel edit mode
    cancelButton.addEventListener('click', (e) => {
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach((el) => {
            el.innerHTML = originalValues[el.id];
            el.contentEditable = 'false';
            el.classList.remove('border');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');
    });

    // Save Changes
    saveButton.addEventListener('click', async (e) => {
        const editableElements = document.querySelectorAll('.editable');
        const updatedData = {};
        editableElements.forEach((el) => {
            updatedData[el.id] = el.innerHTML;
            el.contentEditable = 'false';
            el.classList.remove('border');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');

        await apiEditRecipe(updatedData);
    });

    await loadRecipeData();
});
