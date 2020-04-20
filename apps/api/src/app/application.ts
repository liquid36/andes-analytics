import { ApiBootstrap } from '@andes/api-tool/build/bootstrap';
import { environment } from '../environments/environment';
const shiroTrie = require('shiro-trie');

const info = {
    name: 'andes-analytics',
    version: '1.0.0'
}

const port = environment.port;
const host = environment.host;
const key = environment.key;

export const application = new ApiBootstrap(info, { port, host, key });

export const authenticate = () => {
    if (environment.key) {
        return application.authenticate();
    } else {
        // Bypass Auth
        return (req, res, next) => next();
    }
}

export const checkPermission = (req: any, permiso: string) => {
    if (req.user && req.user.permisos) {
        const shiro = shiroTrie.new();
        shiro.add((req as any).user.permisos);
        return shiro.check(permiso);
    }
}