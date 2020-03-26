require('dotenv').config();

var proxy = require('express-http-proxy');

const { application } = require('./app/application');

const andes = require('./app/routes/andes').router;
const auth = require('./app/routes/auth').router;

application.add({ path: '/api/andes', router: andes });
application.add({ path: '/api/auth', router: auth });

const snowstormProxy = proxy(process.env.SNOWSTORM_HOST);
application.add({ path: '/api/snowstorm', router: snowstormProxy });

application.start();
