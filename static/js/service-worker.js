self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/account',
                '/recipes',
                '/index.html',
                '/styles.css',
                '/app.js',
                '/account.html',
                '/index.html',
                '/recipe.html',
                '/recipes.html',
                '/user.html',
                '/css/index.css',
                '/css/recipe.css',
                '/css/recipes.css',
                '/css/style.css',
                '/html/footer.html',
                '/html/navbar.html',
                '/img/header-background.jpg',
                '/img/placeholder-pfp.png',
                '/js/account.js',
                '/js/api.js',
                '/js/index.js',
                '/js/login.js',
                '/js/navbar.js',
                '/js/pullhtml.js',
                '/js/recipe.js',
                '/js/recipes.js',
                '/js/service-worker.js',
                '/js/user.js',
            ]);
        }),
    );
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('Returning cached response for:', event.request.url);
                return response; // Return cache
            }

            // Handle /recipe/* urls
            if (event.request.url.includes('/recipe/')) {
                console.log('Recipe URL detected, returning cached recipe.html...');
                return caches.match('/recipe.html').then((cachedRecipe) => {
                    if (cachedRecipe) {
                        return cachedRecipe;
                    }
                    // network fetch if not in cache
                    return fetch(event.request).then((networkResponse) => {
                        console.log('Fetching from network:', event.request.url);
                        caches.open('v1').then((cache) => {
                            console.log('Caching fetched recipe.html...');
                            cache.put(event.request, networkResponse.clone());
                        });
                        return networkResponse;
                    });
                });
            }

            console.log('Fetching from network:', event.request.url);
            return fetch(event.request);
        }),
    );
});
