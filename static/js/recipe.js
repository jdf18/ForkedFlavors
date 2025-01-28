function setupMethodStepHighlights() {
    const methodSteps = document.querySelectorAll('.method li.list-group-item');

    methodSteps.forEach((methodStep) => {
        methodStep.addEventListener('click', (e) => {
            methodSteps.forEach((step) => step.classList.remove('active-step'));
            methodStep.classList.add('active-step');
        });
    });
}

async function loadAuthorAccount(authorId) {
    const author = await window.apiGetProfileById(authorId);

    if (author == null) return;

    document.getElementById('account-display-name').innerText = author.displayName;
    document.getElementById('account-bio').innerText = author.bio;
    if (author.pfpLink === undefined) {
        document.getElementById('account-pfp').src = '/img/placeholder-pfp.png';
    } else {
        document.getElementById('account-pfp').src = author.pfpLink;
    }
}

async function loadRecipeData() {
    const recipeData = await window.apiGetCurrentRecipe();

    const recipeHeader = document.querySelector('.recipe-header');
    const imageUrl = ((recipeData.image === null) ? '/img/header-background.jpg' : recipeData.image);
    recipeHeader.style.backgroundImage = `url(${imageUrl})`;

    const title = document.getElementById('EditableRecipeTitle');
    title.innerText = recipeData.title;

    const description = document.getElementById('EditableDescription');
    description.innerText = recipeData.description;

    const photo = document.getElementById('EditablePhotoUrl');
    photo.innerText = recipeData.image;

    const forkLabel = document.getElementById('forkLabel');
    if (recipeData.upstream == null) {
        forkLabel.innerHTML = '';
    } else {
        const forkData = await window.apiGetRecipe(recipeData.upstream);
        forkLabel.innerHTML = `Forked from <strong><a href="/recipe/${recipeData.upstream}">${forkData.title}</a></strong>`;
    }

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

    await loadAuthorAccount(recipeData.user);
}

window.initRecipe = async function () {
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const cancelButton2 = document.getElementById('cancelButton2');

    const editButtonGroup = document.getElementById('contentEditButtons');

    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const addMethodStepBtn = document.getElementById('add-step-btn');

    const forkRecipeBtn = document.getElementById('forkRecipeBtn');

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

        await window.apiEditRecipe(updatedData);
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

    forkRecipeBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const recipeId = await window.apiForkRecipe(window.getCurrentRecipeId());
        window.location.href = `/recipe/${recipeId}`;
    });

    await loadRecipeData();
};
// document.addEventListener('DOMContentLoaded', window.initRecipe);
