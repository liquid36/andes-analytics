
require('dotenv').config();

const { application } = require('./app/application');

const snomed = require('./app/routes/snomed').router;
const andes = require('./app/routes/andes').router;
const auth = require('./app/routes/auth').router;

application.add({ path: '/api/snomed', router: snomed });
application.add({ path: '/api/andes', router: andes });
application.add({ path: '/api/auth', router: auth });

application.start();