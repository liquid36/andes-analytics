import { getPrestacionTx, getMetadata, getConceptosNumericos } from './database';

export async function createMetaindex() {
    const PrestacionTx = await getPrestacionTx();
    const Metadata = await getMetadata();

    // Clean DATA.
    console.log('clean metadata')
    await Metadata.remove();

    // Organizaciones
    console.log('start organizaciones')
    const organizaciones = await PrestacionTx.aggregate([
        {
            $group: {
                _id: '$organizacion.id',
                organizacion: { $first: '$organizacion' }
            }
        },
        {
            $project: {
                key: '$organizacion.id',
                nombre: '$organizacion.nombre',
                type: 'organizacion'
            }
        }
    ], { allowDiskUse: true }).toArray();

    organizaciones.forEach(doc => { delete doc._id; });

    await Metadata.insertMany(organizaciones);
    console.log('end organizaciones')

    // profesionales
    console.log('start profesionales')
    const profesionales = await PrestacionTx.aggregate([
        {
            $group: {
                _id: '$profesional.id',
                profesional: { $first: '$profesional' }
            }
        },
        {
            $project: {
                key: '$profesional.id',
                nombre: '$profesional.nombre',
                type: 'profesional'
            }
        }
    ], { allowDiskUse: true }).toArray();

    profesionales.forEach(doc => { delete doc._id; });

    await Metadata.insertMany(profesionales);
    console.log('end profesionales')

    // TipoPrestacion
    console.log('start tipo prestacion')
    const tipoPrestacion = await PrestacionTx.aggregate([
        { $unwind: '$registros' },
        {
            $group: {
                _id: '$registros.tipoPrestacion.conceptId',
                tipoPrestacion: { $first: '$registros.tipoPrestacion' }
            }
        },
        {
            $project: {
                key: '$tipoPrestacion.conceptId',
                nombre: '$tipoPrestacion.term',
                type: 'prestacion'
            }
        }
    ], { allowDiskUse: true }).toArray();

    tipoPrestacion.forEach(doc => { delete doc._id; });

    await Metadata.insertMany(tipoPrestacion);
    console.log('end tipo prestacion')

    // TipoPrestacion
    console.log('start localidad')
    const localidades = await PrestacionTx.aggregate([
        { $unwind: '$registros' },
        {
            $group: {
                _id: '$registros.paciente.localidad'
            }
        },
        {
            $project: {
                key: '$_id',
                nombre: '$_id',
                type: 'localidad'
            }
        }
    ], { allowDiskUse: true }).toArray();

    localidades.forEach(doc => { delete doc._id; });

    await Metadata.insertMany(localidades);
    console.log('end tipo prestacion')

    // TipoPrestacion
    console.log('start sexo')
    await Metadata.insertMany([
        { key: 'masculino', nombre: 'Masculino', type: 'sexo' },
        { key: 'femenino', nombre: 'Femenino', type: 'sexo' }
    ]);
    console.log('end sexo')

}


export async function createConceptosNumericos() {
    const PrestacionTx = await getPrestacionTx();
    const ConceptosNumericos = await getConceptosNumericos();

    console.log('start conceptos numericos');

    await ConceptosNumericos.remove();

    await PrestacionTx.aggregate([
        { $match: { 'registros.valorType': 'number' } },
        { $group: { _id: '$concepto.conceptId', 'concepto': { $first: '$concepto' } } },
        { $replaceRoot: { newRoot: '$concepto' } },
        { $out: 'conceptos_numericos' }
    ]).toArray();

    console.log('end conceptos numericos');


}