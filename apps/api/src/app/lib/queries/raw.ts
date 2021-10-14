import { ConceptId, Params, Periodo } from '../../types';
import { getConnection, MAIN_DB } from '../database';
import { makeBasePipeline } from './helpers';

async function query(conceptId: ConceptId, periodo: Periodo, params: Params, group, project) {
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);

    const { pipeline, needUnwind } = makeBasePipeline(conceptId, periodo, params, { forceUnwind: true });
    // const metadataID = createIdMetadata(group);
    // const addOns = group ? createAddOn(group, params) : [];

    const countKey = needUnwind ? 1 : '$total';

    project = project || ['fecha', 'profesionalNombre', 'organizacionNombre', 'tipoPrestacion', 'concepto', 'semtag', 'edad', 'sexo', 'localidad', 'latitud', 'longitud' ,'valor'];
    const project$ = project.reduce((acc, curr) => {  return {  ...acc, [curr] : projectMapping[curr] }  }, {})


    const $pipeline = [
        ...pipeline,
        // ...addOns,
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
                value: project$
                
                // {
                //     fecha: { $dateToString: { date: '$registros.fecha', format: '%Y-%m' } },
                //     profesionalNombre: '$profesional.nombre',
                //     organizacionNombre: '$organizacion.nombre',
                //     tipoPrestacion: '$registros.tipoPrestacion.term',
                //     concepto: '$concepto.term',
                //     semtag: '$concepto.semanticTag',
                //     edad: '$registros.paciente.edad.edad',
                //     sexo: '$registros.paciente.sexo',
                //     localidad: '$registros.paciente.localidad',
                //     latitud: '$registros.paciente.coordenadas.lat',
                //     longitud: '$registros.paciente.coordenadas.lng',
                //     valor: '$registros.valor'
                // }
            }
        }
    ];

    const results = await PrestacionesTx.aggregate($pipeline, { allowDiskUse: true }).toArray();

    results.forEach(r => {
        r.hashId = 'null';
    });
    return results;
}
 


const initial = () => []

const reducer = (acc, value) => {
    acc.push(value);
    return acc;
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
    cache: false,
    unwind: true,
    split: true
}

const projectMapping = {
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
    valor: '$registros.valor',
    documento: '$registros.paciente.documento',
    fechaNacimiento: { $dateToString:  { date: '$registros.paciente.fechaNacimiento', format: '%Y-%m-%d' } },
    pacienteNombre: { $concat: [ '$registros.paciente.apellido' , ' ' , '$registros.paciente.nombre' ] } ,
    concepto_conceptId: '$concepto.conceptId',
    concepto_term: '$concepto.term'
};