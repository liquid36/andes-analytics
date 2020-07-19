
import { MongoClient, ObjectID } from 'mongodb';

const mongoConnection = process.env['ANDES_DB_CONN'] || process.env['MONGO_DB_CONN'] || "localhost:27017";
const databases = {};

export const ObjectId = ObjectID;

export const getConnection = async function () {
    const name = 'andes';
    try {
        if (databases[name]) {
            return databases[name];
        } else {
            const conn = await MongoClient.connect(mongoConnection);
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
    cache.ensureIndex({
        hash_key: 1
    });
    cache.ensureIndex({ 'lastUse': 1 }, { expireAfterSeconds: 2592000 }); // 1 mes
}

ensureIndex();

export const MAIN_DB = 'prestacionTx';
export const CACHE_DB = 'cache';