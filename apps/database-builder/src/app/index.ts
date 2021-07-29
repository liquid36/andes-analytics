import * as moment from 'moment';
import { createPrestacionTx, getCache, getListaEspera, getPrestaciones, getPrestacionTx } from './database';
import { calcularEdad } from './edad';
import { createConceptosNumericos, createMetaindex, populateConceptos } from './metaindex';
import { findPaciente, getCoordenadas, getLocalidad } from './paciente';
import { flatPrestacion } from './prestaciones';

function removeDuplicate(items): any[] {
    const deduplicado = items.reduce((acc, current) => {
        if (!acc[current.concepto.conceptId]) {
            acc[current.concepto.conceptId] = current;
        }
        return acc;
    }, {});
    return Object.values(deduplicado);
}



async function addBucket(item) {
    item.organizacion.id = item.organizacion.id.toString();
    item.profesional.id = item.profesional.id && item.profesional.id.toString();
    item.registroId = item.registroId && item.registroId.toString();
    item.prestacionId = item.prestacionId && item.prestacionId.toString();
    if (item.paciente) {
        item.paciente.id = item.paciente.id.toString();
        // delete item.paciente['nombre'];
        // delete item.paciente['apellido'];
        // delete item.paciente['documento'];
    }

    if (item.tipoPrestacion) {
        delete item.tipoPrestacion['id'];
        delete item.tipoPrestacion['_id'];
    }

    delete item.concepto['_id'];
    delete item.concepto['id']; 

    const PrestacionTx = await getPrestacionTx();
    const inc: any = {
        total: 1
    };

    const start = moment(item.fecha.ejecucion).startOf('month').toDate();
    const end = moment(item.fecha.ejecucion).endOf('month').toDate();
    await PrestacionTx.updateMany(
        {
            'concepto.conceptId': item.concepto.conceptId,
            start,
            end,
            'organizacion.id': item.organizacion.id,
            'profesional.id': item.profesional && item.profesional.id,
            'total' : { $lte : 1000 }
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
                    ambito: item.ambito,
                    turno: item.turno
                }
            },
            // $addToSet: { tipoPrestacion: item.tipoPrestacion.conceptId, pacientes: item.paciente && item.paciente.id },
        },
        {
            upsert: true
        }
    );
}


async function processPrestacion(prestacion) {
    if (prestacion.estados[prestacion.estados.length - 1].tipo !== 'validada') {
        return;
    }

    const estEjecucion = prestacion.estados.find(i => i.tipo === 'ejecucion');
    const estValidacion = prestacion.estados.find(i => i.tipo === 'validada');
    const tx = {
        prestacionId: prestacion._id,
        paciente: prestacion.paciente,
        tipoPrestacion: prestacion.solicitud.tipoPrestacion,
        organizacion: prestacion.solicitud.organizacion,
        ambito: prestacion.solicitud.ambitoOrigen,
        turno: !!prestacion.solicitud.turno,
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


    let tipoPrestacion = prestacion.solicitud.tipoPrestacion;
    const a = await addBucket({
        esPrestacion: true,
        ...tx,
        concepto: tipoPrestacion,
        valor: null,
        term: tipoPrestacion.term,
        prestacionId: prestacion._id,
        registroId: null
    });
    // }

    const items = removeDuplicate(flatPrestacion(prestacion));

    const ps = items.map(async item => {
        let valorType: string = typeof item.valor;
        if (!item.valor) { valorType = 'null'; }
        if (item.valor && Array.isArray(item.valor)) { valorType = 'array'; }
        if (item.valor && item.valor.concepto) { valorType = 'snomed'; }

        if (valorType === 'string') {
            item.valor = null;
        }

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
    const BATCH_SIZE = 30;
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


async function processBatch(cursor, callback, progressCallback) {
    while (await cursor.hasNext()) {
        progressCallback && progressCallback(30);

        const items = await nextBatch(cursor);

        const ps = items.map(callback);
        await Promise.all(ps);
    }
}

export async function run(fechaMin, fechaMax) {
    // const fechaMin = moment().subtract(3, 'month').startOf('month').toDate();
    // const fechaMax = moment().subtract(3, 'month').startOf('month').toDate();

    // const fechaMin = moment('2018-01-01 00:13:18.926Z').toDate();
    // const fechaMax = moment('2019-06-30 23:59:59.926Z').toDate();

    let total = 0;
    // await searchGeocode();
    await createPrestacionTx();
    const Prestacion = await getPrestaciones();
    const PrestacionTx = await getPrestacionTx();

    await PrestacionTx.deleteMany({
        start: { $gte: moment().subtract(3, 'months').startOf('months').toDate() }
    });

    console.log(buildFechaQuery('ejecucion.fecha', fechaMin, fechaMax));
    
    const cursor = Prestacion.find({
        'estadoActual.tipo': 'validada',
        ...buildFechaQuery('ejecucion.fecha', fechaMin, fechaMax)
    }, { batchSize: 3000 });
    while (await cursor.hasNext()) {
        total += 30;
        if (total % 3000 === 0) {
            console.log(total);
        }

        const prestaciones = await nextBatch(cursor);

        const ps = prestaciones.map(processPrestacion);
        await Promise.all(ps);
    }

    const Cache = await getCache();
    await Cache.deleteMany({});

    await listaEspera(fechaMin, fechaMax);
    await createMetaindex();
    await createConceptosNumericos();
    await populateConceptos();
}

function buildFechaQuery(key: string, fechaMin, fechaMax) {
    const q = { [key] : {} };
    if (fechaMin) {
        q[key]['$gte'] = fechaMin;
    }

    if (fechaMax) {
        q[key]['$lte'] = fechaMax;
    }
    return q;
}

export async function listaEspera(fechaMin, fechaMax) {
    console.log('Starting lista espera');

    let total = 0;
    const ListaEspera = await getListaEspera();

    const cursor = ListaEspera.find({
        paciente: { $exists: true }, 
        ...buildFechaQuery('fecha', fechaMin, fechaMax)
        // fecha: { $gt: moment().subtract(3, 'month').startOf('month').toDate() }
    });

    const lsitaEsperaAction = async (item) => {

        const getProfesional = (item) => {
            if (item.profesional) {
                return {
                    id: item.profesional.id,
                    nombre: `${item.profesional.apellido} ${item.profesional.nombre}`
                }
            }
            return { id: null, nombre: 'SIN PROFESIONAL' }
        }

        const getPrestacion = (item) => {
            if (item.tipoPrestacion) {
                return {
                    semanticTag: item.tipoPrestacion.semanticTag,
                    fsn: item.tipoPrestacion.fsn,
                    term: item.tipoPrestacion.term,
                    conceptId: item.tipoPrestacion.conceptId,
                }
            }
            return { conceptId: null, term: 'SIN ESPECIFICAR', fsn: 'SIN ESPECIFICAR', semanticTag: '' }
        }

        const tx = {
            prestacionId: null,
            paciente: item.paciente,
            tipoPrestacion: getPrestacion(item),
            organizacion: item.organizacion,
            profesional: getProfesional(item),
            fecha: {
                ejecucion: item.fecha
            }
        };
        if (tx.paciente) {
            const pac: any = await findPaciente(item.paciente.id);
            if (!pac) {
                return;
            }
            tx.paciente['fechaNacimiento'] = pac.fechaNacimiento;
            tx.paciente['sexo'] = pac.sexo;
            tx.paciente['edad'] = calcularEdad(tx.paciente.fechaNacimiento, tx.fecha.ejecucion);
            tx.paciente['coordenadas'] = await getCoordenadas(pac);
            tx.paciente['localidad'] = getLocalidad(pac);
        }


        const concepto = {
            conceptId: '6901000013109',
            fsn: 'demanda no satisfecha (situación)',
            term: 'demanda no satisfecha',
            semanticTag: 'situación'
        }

        await addBucket({
            esPrestacion: false,
            ...tx,
            concepto: concepto,
            valor: null,
            term: concepto.term,
            prestacionId: null,
            registroId: null
        });
    }

    const progreso = (amount) => {
        total += amount;
        if (total % 3000 === 0) {
            console.log(total);
        }
    }

    await processBatch(cursor, lsitaEsperaAction, progreso);

    console.log('end lista espera');
}