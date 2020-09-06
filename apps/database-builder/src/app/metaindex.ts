import { getPrestacionTx, getMetadata, getConceptosNumericos, getOrganizacion, getOrganizaciones } from './database';
import { getConcepts, toDBStore, getConceptsAncestors } from './snomed';

export async function createMetaindex() {
    const PrestacionTx = await getPrestacionTx();
    const Metadata = await getMetadata();
    const Organizacion = await getOrganizacion();
    const Organizaciones = await getOrganizaciones();

    // Clean DATA.
    console.log('clean metadata')
    await Metadata.deleteMany({});
    await Organizaciones.deleteMany({});

    await Organizacion.aggregate([
        {
            $project: {
                _id: { $toString: '$_id' },
                id: { $toString: '$_id' },
                nombre: 1,
                direccion: 1
            }
        },
        {
            $out: 'organizaciones'
        }
    ], { allowDiskUse: true }).toArray();


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
    console.log('end sexo');

    console.log('start ambito')
    await Metadata.insertMany([
        { key: 'internacion', nombre: 'Internacion', type: 'ambito' },
        { key: 'ambulatorio', nombre: 'Ambulatorio', type: 'ambito' }
    ]);
    console.log('end ambito');


    console.log('start turno')
    await Metadata.insertMany([
        { key: 'true', nombre: 'Con turno', type: 'turno' },
        { key: 'false', nombre: 'Sin turno', type: 'turno' }
    ]);
    console.log('end turno');


}


export async function createConceptosNumericos() {
    const PrestacionTx = await getPrestacionTx();
    const ConceptosNumericos = await getConceptosNumericos();

    console.log('start conceptos numericos');

    await ConceptosNumericos.deleteMany({});

    await PrestacionTx.aggregate([
        { $match: { 'registros.valorType': 'number' } },
        { $group: { _id: '$concepto.conceptId', 'concepto': { $first: '$concepto' } } },
        { $replaceRoot: { newRoot: '$concepto' } },
        { $out: 'conceptos_numericos' }
    ]).toArray();

    console.log('end conceptos numericos');
}

/**
 * A FUTURO TENER EN CUENTA LOS CONCEPTOS QUE SE DESACTIVARON 
 * NO ESTAN MAS EN ELASTIC PRE CALCULADOS
 */

export async function populateConceptos() {
    console.log('start populate conceptos');
    const PrestacionTx = await getPrestacionTx();
    let count = 0;
    while (true) {

        const conceptos = await PrestacionTx.aggregate([
            { $match: { 'concepto.statedAncestors': { $exists: false } } },
            { $limit: 200 },
            { $group: { _id: '$concepto.conceptId', concepto: { $first: '$concepto' } } },
            { $limit: 100 },
            { $replaceRoot: { newRoot: '$concepto' } },
        ]).toArray();

        const cps = conceptos
            .filter(c => c.conceptId !== '12811000013118')
            .filter(c => c.conceptId !== '32780001')
            .map(c => c.conceptId);
        if (cps.length === 0) { break; }

        let realConcept = await getConceptsAncestors(cps)

        console.log(count, conceptos.length, Object.keys(realConcept).length);

        const ps = conceptos.map(concepto => {

            const value = realConcept[concepto.conceptId] || null;

            return PrestacionTx.updateMany(
                { 'concepto.conceptId': concepto.conceptId },
                {
                    $set: {
                        'concepto.statedAncestors': value && value.statedAncestors,
                        'concepto.inferredAncestors': value && value.inferredAncestors,
                        'concepto.activo': !!value
                    }
                }
            );
        })
        await Promise.all(ps);
        count++;
    }
    console.log('end populate conceptos');
}

/**
 *
db.getCollection('prestacionTx').updateMany(
    {  'concepto.statedAncestors': { $exists: true} } ,
    { $unset: { 'concepto.statedAncestors': "",  'concepto.inferredAncestors': ""  } }
)
 */