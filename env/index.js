const dotenv = require('dotenv');

// Set default to "development"
const nodeEnv = process.env.NODE_ENV || 'development';
const result = dotenv.config({
  path: `./env/${nodeEnv}.env`
});

if (result.error) {
  throw result.error;
}
