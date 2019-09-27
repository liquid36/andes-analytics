import { MongoClient } from 'mongodb';
import { environment } from '../environments/environment';

const databases = {};

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

export async function getLocalidades() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('localidades');
}

export async function getPrestaciones() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('prestaciones');
}

export async function getPacientes() {
    const db = await getConnection('andes', environment.ANDES_DB);
    return db.collection('paciente');
}

export async function getSnomed() {
    const db = await getConnection('es-edition', environment.SNOMED_DB);
    return db.collection(environment.SNOMED_COLLECTION);
}

export async function createPrestacionTx() {
    const db = await getConnection('andes', environment.ANDES_DB);
    await db.createCollection('prestacionTx');

    const PrestacionTx = await getPrestacionTx();
    PrestacionTx.ensureIndex({
        'concepto.inferredAncestors': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
    PrestacionTx.ensureIndex({
        'concepto.statedAncestors': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
    PrestacionTx.ensureIndex({
        'concepto.conceptId': 1,
        start: 1,
        end: 1,
        'organizacion.id': 1,
        'profesional.id': 1
    });
}