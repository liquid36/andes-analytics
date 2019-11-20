import { getConnection, MAIN_DB, ObjectId } from '../database';
import { makeBasePipeline, createAddOn, createIdMetadata, hash, createLabelMetadata } from './helpers';

async function query(conceptId, periodo, params, group) {
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);

    const self = conceptId.startsWith('!');
    conceptId = self ? conceptId.substr(1) : conceptId;

    const { pipeline, needUnwind } = makeBasePipeline(conceptId, periodo, params, { forceUnwind: !!group, self });
    const metadataID = createIdMetadata(group);
    const addOns = group ? createAddOn(group, params) : [];

    const countKey = needUnwind ? 1 : '$total';

    const $pipeline = [
        ...pipeline,
        ...addOns,
        // {
        //     $group: {
        //         ...metadataID,
        //         total: { $sum: countKey },
        //         exact: {
        //             $sum: {
        //                 $cond: { if: { $eq: ['$concepto.conceptId', conceptId] }, then: countKey, else: 0 }
        //             }
        //         }
        //     },
        // },
        {
            $project: {
                _id: 'null',
                // label: createLabelMetadata(group),
                value: {
                    fecha: { $dateToString: { date: '$registros.fecha', format: '%Y-%m' } },
                    profesionalNombre: '$profesional.nombre',
                    organizacionNombre: '$organizacion.nombre',
                    tipoPrestacion: '$registros.tipoPrestacion.term',
                    concepto: '$concepto.term',
                    semtag: '$concepto.semanticTag',
                    edad: '$registros.paciente.edad.edad',
                    sexo: '$registros.paciente.sexo',
                    localidad: '$registros.paciente.localidad',
                    latitud: '$registros.paciente.coordenadas.lat',
                    longitud: '$registros.paciente.coordenadas.lng',


                }
            }
        }
    ];
    const results = await PrestacionesTx.aggregate($pipeline, { allowDiskUse: true }).toArray();
    results.forEach(r => {
        r.hashId = String(new ObjectId());
    });
    return results;
}

const initial = () => ({
    exact: 0,
    total: 0
})

const reducer = (acc, value) => {
    return {
        total: acc.total + value.total,
        exact: acc.exact + value.exact
    };
}

const transform = (value) => {
    return value;
};


export const QUERY = {
    name: 'raw',
    query,
    reducer,
    initial,
    transform,
    cache: true,
    unwind: true,
    split: true
}