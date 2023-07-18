import { Db, MongoClient } from 'mongodb';
import { environment } from '../environments/environment';

const databases: { [key: string]: Db } = {};

const getConnection = async function (key, name, url) {
    try {
        if (databases[key]) {
            return databases[key];
        } else {
            const conn = await MongoClient.connect(url, { 
                useUnifiedTopology: true, 
                useNewUrlParser: true,
                socketTimeoutMS: 10 * 60 * 1000
            });
            const db = conn.db(name);
            databases[key] = db;
            return db;
        }
    } catch (err) {
        console.warn(err.message);
        process.exit();
    }
}

export async function getPrestacionTx() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('prestacionTx');
}

export async function getMetadata() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('metadata');
}

export async function getConceptos() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('conceptos');
}

export async function getLocalidades() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('localidades');
}

export async function getConceptosNumericos() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('conceptos_numericos');
}

export async function getPrestaciones() {
    const db = await getConnection('andes', 'andes', environment.ANDES_PROD_DB);
    return db.collection('prestaciones');
}

export async function getListaEspera() {
    const db = await getConnection('andes', 'andes', environment.ANDES_PROD_DB);
    return db.collection('listaEspera');
}

export async function getPacientes() {
    const db = await getConnection('andes', 'andes', environment.ANDES_PROD_DB);
    return db.collection('paciente');
}

export async function getOrganizacion() {
    const db = await getConnection('andes', 'andes', environment.ANDES_PROD_DB);
    return db.collection('organizacion');
}

export async function getOrganizaciones() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('organizaciones');
}

export async function getCache() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
    return db.collection('cache');
}

export async function createPrestacionTx() {
    const db = await getConnection('analytics', 'analytics', environment.ANALYTICS_DB);
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