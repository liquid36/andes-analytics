
import { Db, MongoClient, ObjectID } from 'mongodb';
import { environment } from '../../environments/environment';

const databases: { [key: string]: Db } = {};

export const ObjectId = ObjectID;

export const getConnection = async function () {
    const name = 'andes';
    try {
        if (databases[name]) {
            return databases[name];
        } else {
            const conn = await MongoClient.connect(environment.db, { poolSize: 24, useNewUrlParser: true, useUnifiedTopology: true });
            const db = conn.db(name);
            databases[name] = db;
            return db;
        }
    } catch (err) {
        console.warn(err.message);
        process.exit();
    }
}

async function ensureIndex() {
    const db = await getConnection();
    const cache = db.collection('cache');
    cache.createIndex({
        hash_key: 1
    });
    cache.createIndex({ 'lastUse': 1 }, { expireAfterSeconds: 2592000 }); // 1 mes
}

ensureIndex();

export async function getUserCollection() {
    const db = await getConnection();
    return db.collection('users');
}

export async function getUserFrecuentesCollection() {
    const db = await getConnection();
    return db.collection('UserFrecuentes');
}

export const MAIN_DB = 'prestacionTx';
export const CACHE_DB = 'cache';