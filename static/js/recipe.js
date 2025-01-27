function getRecipeId() {
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
}

async function apiGetRecipe() {
    const recipeId = getRecipeId();

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
    const recipeId = getRecipeId();

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

function setupMethodStepHighlights() {
    const methodSteps = document.querySelectorAll('.method li.list-group-item');

    methodSteps.forEach((methodStep) => {
        methodStep.addEventListener('click', (e) => {
            methodSteps.forEach((step) => step.classList.remove('active-step'));
            methodStep.classList.add('active-step');
        });
    });
}

async function loadRecipeData() {
    const recipeData = await apiGetRecipe();

    const recipeHeader = document.querySelector('.recipe-header');
    const imageUrl = ((recipeData.image === null) ? '/img/header-background.jpg' : recipeData.image)
    recipeHeader.style.backgroundImage = `url(${imageUrl})`

    const title = document.getElementById('EditableRecipeTitle');
    title.innerText = recipeData.title;

    const photo = document.getElementById('EditablePhotoUrl');
    photo.innerText = recipeData.image;

    const ingredientsList = document.getElementById('ingredients-list');
    if (!ingredientsList) {
        console.error('Idk it broke and it should not have');
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
    });

    const methodList = document.getElementById('method-list');
    if (!methodList) {
        console.error('Idk it broke and it should not have');
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
    });

    setupMethodStepHighlights();
}

document.addEventListener('DOMContentLoaded', async () => {
    const createNewButton = document.getElementById('create-new-btn');

    createNewButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const recipeId = await apiCreateRecipe();

        window.location.href = `/recipe/${recipeId}`;
    });

    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const cancelButton2 = document.getElementById('cancelButton2');

    const editButtonGroup = document.getElementById('contentEditButtons');

    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const addMethodStepBtn = document.getElementById('add-step-btn');

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

        const editingElements = document.querySelectorAll('.editing');
        editingElements.forEach((el) => {
            el.classList.remove('d-none');
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

        const editingElements = document.querySelectorAll('.editing');
        editingElements.forEach((el) => {
            el.classList.add('d-none');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');

        setupMethodStepHighlights();
    });

    cancelButton2.addEventListener('click', (e) => {
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach((el) => {
            el.innerHTML = originalValues[el.id];
            el.contentEditable = 'false';
            el.classList.remove('border');
        });

        const editingElements = document.querySelectorAll('.editing');
        editingElements.forEach((el) => {
            el.classList.add('d-none');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');

        setupMethodStepHighlights();
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

        const editingElements = document.querySelectorAll('.editing');
        editingElements.forEach((el) => {
            el.classList.add('d-none');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');

        setupMethodStepHighlights();

        await apiEditRecipe(updatedData);
    });

    addIngredientBtn.addEventListener('click', () => {
        const ingredientsList = document.getElementById('ingredients-list');
        if (!ingredientsList) {
            console.error('Idk it broke and it should not have');
            return;
        }

        const li = document.createElement('li');
        li.textContent = '';
        li.className = 'list-group-item editable border';
        li.setAttribute('contenteditable', 'true');
        li.id = `EditableIngredient${ingredientsList.childNodes.length + 1}`;
        ingredientsList.appendChild(li);
    });

    addMethodStepBtn.addEventListener('click', () => {
        const methodList = document.getElementById('method-list');
        if (!methodList) {
            console.error('Idk it broke and it should not have');
            return;
        }

        const li = document.createElement('li');
        li.textContent = '';
        li.className = 'list-group-item editable border';
        li.setAttribute('contenteditable', 'true');
        li.id = `EditableMethod${methodList.childNodes.length + 1}`;
        methodList.appendChild(li);
    });

    await loadRecipeData();
});
