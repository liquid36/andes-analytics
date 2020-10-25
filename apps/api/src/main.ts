require('dotenv').config();

const proxy = require('express-http-proxy');

const { application } = require('./app/application');

const andes = require('./app/routes/andes').router;
const auth = require('./app/routes/auth').router;
const info = require('./app/routes/info').router;
const user = require('./app/routes/user').router;

application.add({ path: '/api/andes', router: andes });
application.add({ path: '/api/auth', router: auth });
application.add({ path: '/api/user', router: user });
application.add({ path: '/api', router: info });

const snowstormProxy = proxy(process.env.SNOWSTORM_HOST);
application.add({ path: '/api/snowstorm', router: snowstormProxy });

application.start();
