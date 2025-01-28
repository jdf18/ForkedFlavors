/* global bootstrap */

async function updatePageProfile() {
    const username = 'self';
    const profileData = await window.apiGetProfile(username);

    if (profileData == null) return;

    document.getElementById('account-display-name').innerText = profileData.displayName;
    document.getElementById('account-bio').innerText = profileData.bio;
    if (profileData.pfpLink === undefined) {
        document.getElementById('account-pfp').src = '/img/placeholder-pfp.png';
    } else {
        document.getElementById('account-pfp').src = profileData.pfpLink;
    }
}

window.initAccount = async function () {
    await updatePageProfile();

    const accountModal = new bootstrap.Modal(document.getElementById('accountModal'));
    const deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));

    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        window.apiGetProfile('self').then((profile) => {
            document.getElementById('account-form-display-name').value = profile.displayName;
            document.getElementById('account-form-bio').value = profile.bio;
        });
        accountModal.show();
    });

    document.getElementById('delete-account-btn').addEventListener('click', () => {
        deleteAccountModal.show();
    });

    document.getElementById('account-form-submit-btn').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const displayName = document.getElementById('account-form-display-name').value;
        const bio = document.getElementById('account-form-bio').value;

        await window.apiModifyProfile(displayName, bio);

        accountModal.hide();
        await updatePageProfile();
    });

    document.getElementById('cancelDeleteAccount').addEventListener('click', () => {
        deleteAccountModal.hide();
    });

    document.getElementById('confirmDeleteAccount').addEventListener('click', () => {
        window.apiDeleteAccount();
        window.apiLogout();

        window.location.href = '/';
    });
};
// document.addEventListener('DOMContentLoaded', window.initAccount);
