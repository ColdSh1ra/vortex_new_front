// Vercel serverless entry: the whole Express app (API + SSR) runs as one function.
// Local development still uses server/src/server.js, which calls app.listen().
module.exports = require('../server/src/app');
