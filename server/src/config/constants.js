const path = require('path');

const PORT = process.env.PORT || 5001;
const VORTEX_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'vortex.json');

module.exports = {
  PORT,
  VORTEX_DATA_PATH,
};
