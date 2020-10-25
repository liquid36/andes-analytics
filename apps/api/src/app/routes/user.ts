import { application } from '../application';
import { getFrecuentes, registerFrecuente } from '../lib/users';

export const router = application.router();


router.post('/frecuentes', application.authenticate(), async (req, res, next) => {

    const concepto = req.body;
    const userId = req.user.usuario.id;

    await registerFrecuente(userId, concepto);

    return res.json({ status: 'ok' });
});

router.get('/frecuentes', application.authenticate(), async (req, res) => {
    const userId = req.user.usuario.id;

    const frecuentes = await getFrecuentes(userId);
    return res.json(frecuentes);
})