import * as moment from 'moment';
import { getPrestacionTx, createPrestacionTx, getPrestaciones } from './database';
import { calcularEdad } from './edad';
import { findSnomed, getConcept } from './snomed'
import { flatPrestacion } from './prestaciones';
import { getCoordenadas, getLocalidad, findPaciente } from './paciente';
import { searchGeocode } from './localidades';

async function addBucket(item) {
    item.organizacion.id = item.organizacion.id.toString();
    item.profesional.id = item.profesional.id.toString();
    item.registroId = item.registroId && item.registroId.toString();
    item.prestacionId = item.prestacionId.toString();
    if (item.paciente) {
        item.paciente.id = item.paciente.id.toString();
        delete item.paciente['nombre'];
        delete item.paciente['apellido'];
        delete item.paciente['documento'];
    }
    delete item.tipoPrestacion['id'];
    delete item.tipoPrestacion['_id'];
    delete item.concepto['_id'];
    delete item.concepto['id'];


    const prestacionTx = await getPrestacionTx();
    const inc: any = {
        total: 1
    };

    const start = moment(item.fecha.ejecucion).startOf('month').toDate();
    const end = moment(item.fecha.ejecucion).endOf('month').toDate();
    await prestacionTx.update(
        {
            'concepto.conceptId': item.concepto.conceptId,
            start,
            end,
            'organizacion.id': item.organizacion.id,
            'profesional.id': item.profesional.id
        },
        {
            $inc: inc,
            $setOnInsert: {
                concepto: item.concepto,
                start,
                end,
                organizacion: item.organizacion,
                profesional: item.profesional
            },
            $push: {
                registros: {
                    prestacionId: item.prestacionId,
                    registroId: item.registroId,
                    term: item.term,
                    paciente: item.paciente,
                    tipoPrestacion: item.tipoPrestacion,
                    esPrestacion: item.esPrestacion,
                    valor: item.valor,
                    valorType: item.valorType,
                    fecha: item.fecha.ejecucion,
                }
            }
        },
        {
            upsert: true
        }
    );
}


async function processPrestacion(prestacion) {
    const estEjecucion = prestacion.estados.find(i => i.tipo === 'ejecucion');
    const estValidacion = prestacion.estados.find(i => i.tipo === 'validada');
    const tx = {
        prestacionId: prestacion._id,
        paciente: prestacion.paciente,
        tipoPrestacion: prestacion.solicitud.tipoPrestacion,
        organizacion: prestacion.solicitud.organizacion,
        profesional: {
            id: estEjecucion.createdBy.id || prestacion.solicitud.profesional.id,
            nombre: `${estEjecucion.createdBy.apellido} ${estEjecucion.createdBy.nombre}`
        },
        fecha: {
            ejecucion: estEjecucion ? estEjecucion.createdAt : null,
            validacion: estValidacion ? estValidacion.createdAt : null
        }
    };
    if (tx.paciente) {
        const pac: any = await findPaciente(prestacion.paciente.id);

        tx.paciente['edad'] = calcularEdad(tx.paciente.fechaNacimiento, tx.fecha.ejecucion);
        tx.paciente['coordenadas'] = await getCoordenadas(pac);
        tx.paciente['localidad'] = getLocalidad(pac);
    }


    const items = flatPrestacion(prestacion);
    const ids = [...items.map(i => i.concepto.conceptId), prestacion.solicitud.tipoPrestacion.conceptId];

    await findSnomed(ids);


    let tipoPrestacion = prestacion.solicitud.tipoPrestacion;
    const prestacionConcept = getConcept(tipoPrestacion.conceptId);

    if (prestacionConcept) {
        tipoPrestacion.inferredAncestors = prestacionConcept.inferredAncestors;
        tipoPrestacion.statedAncestors = prestacionConcept.statedAncestors;
        // tipoPrestacion.relationships = prestacionConcept.relationships.filter(r => r.active);
        const a = await addBucket({
            esPrestacion: true,
            ...tx,
            concepto: tipoPrestacion,
            valor: null,
            term: tipoPrestacion.term,
            prestacionId: prestacion._id,
            registroId: null
        });
    }

    const ps = items.map(async item => {
        const itemConcept = getConcept(item.concepto.conceptId);
        if (itemConcept) {
            item.concepto.inferredAncestors = itemConcept.inferredAncestors;
            item.concepto.statedAncestors = itemConcept.statedAncestors;
            // item.concepto.relationships = itemConcept.relationships.filter(r => r.active);
        }
        let valorType: string = typeof item.valor;
        if (!item.valor) { valorType = 'null'; }
        if (item.valor && Array.isArray(item.valor)) { valorType = 'array'; }
        if (item.valor && item.valor.concepto) { valorType = 'snomed'; }

        await addBucket({
            esPrestacion: false,
            ...tx,
            ...item,
            valorType,
            term: item.concepto.term
        });
    });

    return Promise.all(ps);
}

async function nextBatch(cursor) {
    const BATCH_SIZE = 10;
    const items = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
        if (await cursor.hasNext()) {
            const item = await cursor.next()
            items.push(item);
        } else {
            break;
        }
    }
    return items;
}

export async function run() {
    let total = 0;
    await searchGeocode();
    await createPrestacionTx();
    const Prestacion = await getPrestaciones();

    const cursor = Prestacion.find({
        'estados.tipo': {
            $ne: 'modificada',
            $eq: 'validada'
        },
        'ejecucion.fecha': {
            // $gt: moment('2018-01-01 00:13:18.926Z').toDate(),
            // $lte: moment('2019-06-30 23:59:59.926Z').toDate()
            // $gte: moment('2019-06-30 23:59:59.926Z').toDate(),
            // $lte: moment('2019-09-30 23:59:59.926Z').toDate()
            $gte: moment('2019-09-30 23:59:59.926Z').toDate()
            // $lte: moment('2019-09-30 23:59:59.926Z').toDate()
        },
    }, { batchSize: 1000 });
    while (await cursor.hasNext()) {
        total += 10;
        if (total % 1000 === 0) {
            console.log(total);
        }

        const prestaciones = await nextBatch(cursor);
        const ps = prestaciones.map(processPrestacion);
        await Promise.all(ps);
    }

    process.exit(0);

}
