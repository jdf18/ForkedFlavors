function editRecipe(data) {

}

document.addEventListener('DOMContentLoaded', () => {
    const methodSteps = document.querySelectorAll('.method li.list-group-item');

    methodSteps.forEach((methodStep) => {
        methodStep.addEventListener('click', (e) => {
            methodSteps.forEach((step) => step.classList.remove('active-step'));
            methodStep.classList.add('active-step');
        });
    });

    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');

    const editableElements = document.querySelectorAll('.editable');
    const editButtonGroup = document.getElementById('contentEditButtons');

    let originalValues = {};

    // Enable edit mode
    editButton.addEventListener('click', (e) => {
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
        editableElements.forEach((el) => {
            el.innerHTML = originalValues[el.id];
            el.contentEditable = 'false';
            el.classList.remove('border');
        });

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');
    });

    // Save Changes
    saveButton.addEventListener('click', (e) => {
        const updatedData = {};
        editableElements.forEach((el) => {
            updatedData[el.id] = el.value;
            el.contentEditable = 'false';
            el.classList.remove('border');
        });

        editRecipe(updatedData);

        editButtonGroup.classList.add('d-none');
        editButton.classList.remove('d-none');
    });
});
