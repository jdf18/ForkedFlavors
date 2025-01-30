const config = {
    setupFiles: ['<rootDir>/jest.setup.js'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/db.js',
        'src/recipe.js',
    ],
};

module.exports = config;
