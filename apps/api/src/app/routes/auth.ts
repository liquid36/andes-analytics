import { application } from '../application';
import { environment } from '../../environments/environment';
import { createOrUpdate } from '../lib/users';

const request = require('request-promise-native');

export const router = application.router();

async function getTokenInfo(token) {
    const options = {
        uri: `${environment.andesHost}/api/auth/sesion`,
        headers: {
            'Authorization': `JWT ${token}`
        },
        json: true
    };
    return await request(options);
}

router.post('/login', async (req, res, next) => {
    try {
        const token = req.body.token;
        const user = await getTokenInfo(token);

        user.permisos = user.permisos.filter((item: string) => {
            return item.startsWith('analytics');
        });

        if (user.permisos.legnth === 0) {
            throw new Error('unauthorized')
        }

        console.log(user)

        delete user['exp'];
        delete user['iat'];

        const newToken = await application.sign(user);

        await createOrUpdate(user);

        return res.json({ token: newToken });
    } catch (err) {
        console.log(err);
        return next(403);
    }

});

