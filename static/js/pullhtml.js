async function pullHTML(endpoint, identifier, next) {
    let result;
    try {
        const response = await fetch(`/html/${endpoint}.html`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html',
            },
        });

        result = await response.text();

        if (!response.ok) {
            console.log(`Error: ${result.message}`);
            return null;
        }
    } catch (error) {
        console.log('Something went wrong. Please try again.');
        console.error(error);
        return null;
    }

    const element = document.getElementById(identifier);
    element.innerHTML = result;
    return next();
}
