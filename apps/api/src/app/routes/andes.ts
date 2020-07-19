import { application, authenticate, checkPermission } from '../application';
import { execQuery } from '../lib/analytica';
import { makePattern } from '../lib/util';
import { getConnection, MAIN_DB } from '../lib/database';

export const router = application.router();

function fullAccess(req) {
    if (req.user) {
        const permisos = checkPermission(req, 'analytics:full');
        if (permisos.length === 0) {
            return false;
        }
    }
    return true;
}

function toArray(item) {
    return Array.isArray(item) ? item : [item];
}

router.post('/analytics/:visualization', authenticate(), async function (req, res) {
    let { target, filter, visualization, group } = req.body;
    target = toArray(target);
    group = group && toArray(group);
    filter = filter || {};

    if (!fullAccess(req)) {
        const profesional = req.user.profesional.id;
        filter.profesional = profesional;
    }

    visualization = req.params.visualization;

    const rs = await execQuery(visualization, target, filter, group);
    return res.json(rs);

});


//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

router.get('/organizaciones', async function (req, res) {
    const db = await getConnection();
    const Organizaciones = db.collection('organizaciones');
    const orgs = await Organizaciones.find({}).toArray();
    return res.json(orgs);
});


router.get('/conceptos-numericos', async function (req, res) {
    const db = await getConnection();
    const ConceptosNumericos = db.collection('conceptos_numericos');
    const orgs = await ConceptosNumericos.find({}, { conceptId: 1, term: 1, fsn: 1 }).toArray();
    return res.json(orgs);
});

router.get('/filtros', async function (req, res) {
    const search = req.query.search;
    const type: string = req.query.type;
    const expWord = makePattern(search);
    const $match = {};

    if (type) {
        const types = type.split(',');
        $match['type'] = { $in: types.map(str => str.trim()) };
    }

    const db = await getConnection();
    const Metadata = db.collection('metadata');
    const items = await Metadata.find({
        nombre: { $regex: expWord, $options: 'i' },
        ...$match
    }).toArray();

    return res.json(items);
});



router.post('/rup/cluster', authenticate(), async function (req, res) {
    const $match = {};
    if (!fullAccess(req)) {
        $match['profesional.id'] = req.user.profesional.id;
    }
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);
    const conceptId = req.body.conceptId;
    const semanticTags = req.body.semanticTags || ['trastorno'];
    const tipoAsociacion = req.body.tipoAsociacion || 'paciente';

    if (tipoAsociacion === 'paciente') {
        const pipeline = [
            {
                $match: {
                    $or: [
                        { 'concepto.conceptId': conceptId },
                        { 'concepto.statedAncestors': conceptId }
                    ],
                    ...$match
                }
            },
            { $unwind: '$registros' },
            { $group: { '_id': '$registros.paciente.id' } }
        ];
        const results = await PrestacionesTx.aggregate(pipeline).toArray()
        const ids = results.map(e => e._id);

        const pipeline2 = [
            {
                $match: {
                    'registros.paciente.id': { $in: ids },
                    ...$match
                },
            },
            {
                $match: {
                    'concepto.semanticTag': { $in: semanticTags },
                    'concepto.conceptId': { $ne: conceptId }
                }
            },
            { $unwind: '$registros' },
            { $match: { 'registros.paciente.id': { $in: ids } } },
            {
                $group: {
                    '_id': '$concepto.conceptId',
                    'label': { $first: '$concepto.term' },
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ];
        const concepts = await PrestacionesTx.aggregate(pipeline2).toArray();

        return res.json(concepts);
    } else if (tipoAsociacion === 'prestacion') {
        const pipeline = [
            {
                $match: {
                    $or: [
                        { 'concepto.conceptId': conceptId },
                        { 'concepto.statedAncestors': conceptId }
                    ],
                    ...$match
                }
            },
            { $unwind: '$tipoPrestacion' },
            { $group: { '_id': null, tipoPrestacion: { $addToSet: '$tipoPrestacion' } } }
        ];
        const results = await PrestacionesTx.aggregate(pipeline).toArray()
        const prestaciones = results[0].tipoPrestacion;

        const pipeline2 = [
            {
                $match: {
                    'tipoPrestacion': { $in: prestaciones },
                    'concepto.semanticTag': { $in: semanticTags },
                    'concepto.conceptId': { $ne: conceptId },
                    ...$match
                },
            },
            { $unwind: '$registros' },
            { $match: { 'registros.tipoPrestacion.conceptId': { $in: prestaciones } } },
            {
                $group: {
                    '_id': '$concepto.conceptId',
                    'label': { $first: '$concepto.term' },
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ];
        const concepts = await PrestacionesTx.aggregate(pipeline2).toArray();

        return res.json(concepts);

    }
});

router.post('/rup/maps', authenticate(), async function (req, res) {
    const $match = {};
    if (!fullAccess(req)) {
        $match['profesional.id'] = req.user.profesional.id;
    }

    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);
    const conceptId = req.body.conceptId;

    const pipeline = [
        {
            $match: {
                $or: [
                    { 'concepto.conceptId': conceptId },
                    { 'concepto.statedAncestors': conceptId }
                ],
                ...$match
            }
        },
        { $unwind: '$registros' },
        { $match: { 'registros.paciente.coordenadas': { $ne: null } } },
        {
            $project: {
                'coordenadas': '$registros.paciente.coordenadas',
                'localidad': '$registros.paciente.localidad'
            }
        }
    ];

    function desvio() {
        return (Math.floor(Math.random() * 40000) - 20000) / 1000000;
    }
    const results = await PrestacionesTx.aggregate(pipeline).toArray()

    const r = results.map(point => {
        if (point.coordenadas.aprox) {
            return {
                localidad: point.localidad,
                lat: point.coordenadas.lat + desvio(),
                lng: point.coordenadas.lng + desvio()
            }
        } else {
            return {
                localidad: point.localidad,
                lat: point.coordenadas.lat,
                lng: point.coordenadas.lng
            }
        }
    });
    res.json(r);

});

/*
-38.951929, -68.059161
-38.951739, -68.073225

1KM = 0.020000
20KM = 2

*/


/**
 *
 * Query de concepto con tipo number
 *

 db.getCollection('prestaciontx2').aggregate([
{ $match: { 'registros.valorType' : 'number' } },
{ $group: { _id: '$concepto.conceptId', 'concepto': { $first: '$concepto' } }  },
{ $replaceRoot: { newRoot: '$concepto' } },
{ $sort: { 'fsn': 1 } }
])


 */
