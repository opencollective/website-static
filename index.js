const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

/**
 * Express app
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ) );

require('./config/views')(app);
require('./routes.js')(app);

/**
 * Log
 */
app.use(morgan('dev'));

/**
 * Port config
 */
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  const host = require('os').hostname();
  console.log('OpenCollective Website listening at http://%s:%s in %s environment.', host, port, app.set('env'));
});