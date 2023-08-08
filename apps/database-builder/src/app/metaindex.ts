import * as moment from 'moment';
import { getConceptosNumericos, getMetadata, getOrganizacion, getOrganizaciones, getPrestacionTx } from './database';
import { getConceptsAncestors } from './snomed';

async function insertMetadata(data) {
    const Metadata = await getMetadata();

    return Metadata.updateOne(
        { type: data.type, key: data.key },
        {
            $setOnInsert : {
                type: data.type,
                key: data.key,
                nombre: data.nombre
            }
        },
        { upsert: true }
    )
}

async function insertMetadataMany(list, type) {
    const ps = list.map(doc => insertMetadata({ key: doc.key, nombre: doc.nombre, type: type }));
    await Promise.all(ps);
}


export async function createMetaindex() {

    const fechaLimite = moment('2021-05-01 00:59:59.926Z').toDate();
    const PrestacionTx = await getPrestacionTx();
    const Metadata = await getMetadata();
    const Organizacion = await getOrganizacion();
    const Organizaciones = await getOrganizaciones();

    // Clean DATA.
    console.log('clean metadata')
    // await Metadata.deleteMany({});
    await Organizaciones.deleteMany({});


    // TipoPrestacion
    console.log('start sexo');
    await insertMetadata({ key: 'masculino', nombre: 'Masculino', type: 'sexo' });
    await insertMetadata({ key: 'femenino', nombre: 'Femenino', type: 'sexo' });
    console.log('end sexo');

    
    console.log('start ambito');
    await insertMetadata({ key: 'internacion', nombre: 'Internacion', type: 'ambito' });
    await insertMetadata({ key: 'ambulatorio', nombre: 'Ambulatorio', type: 'ambito' });
    console.log('end ambito');


    console.log('start turno');
    await insertMetadata({ key: 'true', nombre: 'Con turno', type: 'turno' });
    await insertMetadata({ key: 'false', nombre: 'Sin turno', type: 'turno' });
    console.log('end turno');


    console.log('start tabla organizaciones');
    const aggr: any =  Organizacion.find();
    for await (const org of aggr) {
        await Organizaciones.insertOne({
            _id: String(org._id),
            id: String(org._id),
            nombre: org.nombre,
            direccion: org.direccion
        })
    }
    console.log('end tabla organizaciones');
 
    // Organizaciones
    console.log('start organizaciones')
    const organizaciones = await PrestacionTx.aggregate([
        { $match: { start: {$gte: fechaLimite } } },
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
    await insertMetadataMany(organizaciones, 'organizacion');
    console.log('end organizaciones')

    // profesionales
    console.log('start profesionales')
    const profesionales = await PrestacionTx.aggregate([
        { $match: { start: {$gte: fechaLimite } } },
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
    await insertMetadataMany(profesionales, 'profesional');
    console.log('end profesionales');

    // TipoPrestacion
    console.log('start tipo prestacion')
    const tipoPrestacion = await PrestacionTx.aggregate([
        { $match: { start: { $gte: fechaLimite } } },
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
    await insertMetadataMany(tipoPrestacion, 'prestacion');
    console.log('end tipo prestacion')

    // TipoPrestacion
    console.log('start localidad')
    const localidades = await PrestacionTx.aggregate([
        { $match: { start: { $gte: fechaLimite } } },
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
    await insertMetadataMany(localidades, 'localidad');
    console.log('end tipo prestacion')

}


export async function createConceptosNumericos() {
    const fechaLimite = moment('2021-01-01 00:59:59.926Z').toDate();

    const PrestacionTx = await getPrestacionTx();
    const ConceptosNumericos = await getConceptosNumericos();

    console.log('start conceptos numericos');

    await ConceptosNumericos.deleteMany({});

    await PrestacionTx.aggregate([
        { $match: { 'registros.valorType': 'number', start: { $gte: fechaLimite }   } },
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