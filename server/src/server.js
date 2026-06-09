const app = require('./app');
const { PORT } = require('./config/constants');

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
