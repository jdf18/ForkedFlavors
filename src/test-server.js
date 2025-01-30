const fs = require('fs');

fs.cpSync('./test/test-data', './test/data', { recursive: true });

const { app, initTestDB } = require('./app');

initTestDB();

const port = 8080;

app.listen(port, () => {
    console.log(`Forked Flavours app listening on port ${port}`);
});
