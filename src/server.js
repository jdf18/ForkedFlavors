const app = require('./app');

const port = 8080;

app.listen(port, () => {
  console.log(`Forked Flavours app listening on port ${port}`);
});