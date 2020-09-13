import { application } from '../application';
import { environment } from '../../environments/environment';

const request = require('request-promise-native');

export const router = application.router();

async function getAndesVersion() {
    const options = {
        uri: `${environment.andesHost}/api/version`,
        json: true
    };
    return request(options);
}

let branchCache = null;

router.get('/config.json', async (req, res, next) => {
    try {
        if (!branchCache) {
            const version = await getAndesVersion();
            branchCache = version.snomed;
        }
        return res.json({ branch: branchCache });
    } catch (err) {
        return next(400);
    }

});

