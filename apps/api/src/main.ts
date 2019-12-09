
import { ApiBootstrap } from '@andes/api-tool/build/bootstrap';

require('dotenv').config();

const snomed = require('./app/routes/snomed').router;
const andes = require('./app/routes/andes').router;

const info = {
    name: 'andes-analytics',
    version: '1.0.0'
}
const port = parseInt(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const key = '8XOcgoMojZE4CwhluNkM9FtwzCfUPJWhf7'
const application = new ApiBootstrap(info, { port, host, key });

application.add({ path: '/api/snomed', router: snomed });
application.add({ path: '/api/andes', router: andes });

application.start();