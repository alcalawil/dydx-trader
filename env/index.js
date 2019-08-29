let dotenv = require('dotenv');

// Set default to "development"
const nodeEnv = process.env.ENV_FILE || 'development';
const result = dotenv.config({
    path: `./env/${nodeEnv}.env`,
});

if (result.error) {
    throw result.error;
}
