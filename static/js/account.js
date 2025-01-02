/* global bootstrap */

async function apiGetProfile(username) {
    try {
        const response = await fetch(`/api/profile/${username}`, {
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
        return null;
    }
}

async function apiModifyProfile(displayName, bio) {
    try {
        const response = await fetch('/api/modify_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ displayName, bio }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log(`Welcome, ${result.username}!`);
        } else {
            console.log(`Error: ${result.message}`);
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
    }
}

async function updatePageProfile() {
    const username = 'self';
    const profileData = await apiGetProfile(username);

    if (profileData == null) return;

    document.getElementById('account-display-name').innerText = profileData.displayName;
    document.getElementById('account-bio').innerText = profileData.bio;
    if (profileData.pfpLink === undefined) {
        document.getElementById('account-pfp').src = '/img/placeholder-pfp.png';
    } else {
        document.getElementById('account-pfp').src = profileData.pfpLink;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await updatePageProfile();

    const accountModal = new bootstrap.Modal(document.getElementById('accountModal'));

    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        apiGetProfile('self').then((profile) => {
            document.getElementById('account-form-display-name').value = profile.displayName;
            document.getElementById('account-form-bio').value = profile.bio;
        });
        accountModal.show();
    });

    document.getElementById('account-form-submit-btn').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const displayName = document.getElementById('account-form-display-name').value;
        const bio = document.getElementById('account-form-bio').value;

        await apiModifyProfile(displayName, bio);

        accountModal.hide();
        await updatePageProfile();
    });
});
