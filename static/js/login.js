document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
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
    });
});
