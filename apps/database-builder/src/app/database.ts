import { MongoClient, Db } from 'mongodb';
import { environment } from '../environments/environment';

const databases: { [key: string]: Db } = {};

const getConnection = async function (name, url) {
    try {
        if (databases[name]) {
            return databases[name];
        } else {
            const conn = await MongoClient.connect(url);
            const db = conn.db(name);
            databases[name] = db;
            return db;
        }
    } catch (err) {
        console.warn(err.message);
        process.exit();
    }
}

export async function getPrestacionTx() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('prestacionTx');
}

export async function getMetadata() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('metadata');
}

export async function getConceptos() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('conceptos');
}

export async function getLocalidades() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('localidades');
}

export async function getConceptosNumericos() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('conceptos_numericos');
}

export async function getPrestaciones() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('prestaciones');
}

export async function getListaEspera() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('listaEspera');
}

export async function getPacientes() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('paciente');
}

export async function getOrganizacion() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('organizacion');
}

export async function getOrganizaciones() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('organizaciones');
}

export async function getCache() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('cache');
}

export async function createPrestacionTx() {
    const db = await getConnection('andes', environment.ANDES_DB);
    await db.createCollection('prestacionTx');

    const PrestacionTx = await getPrestacionTx();
    PrestacionTx.createIndex({
        'concepto.inferredAncestors': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
    PrestacionTx.createIndex({
        'concepto.statedAncestors': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
    PrestacionTx.createIndex({
        'concepto.conceptId': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
    PrestacionTx.createIndex({
        "registros.paciente.id": 1,
        "concepto.semanticTag": 1,
        "concepto.conceptId": 1
    });
    PrestacionTx.createIndex({
        "registros.tipoPrestacion.conceptId": 1,
        "concepto.semanticTag": 1
    });
    PrestacionTx.createIndex({
        start: 1
    });

}