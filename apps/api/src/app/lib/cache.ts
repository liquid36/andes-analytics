import * as base64 from 'base-64';

import { getConnection, CACHE_DB } from './database';
import { FILTER_AVAILABLE } from './util';

import { Metrica, ConceptId, Periodo, Params, ConceptIds, PeriodoList, GroupList } from '../types';

export async function touchCache(item) {
    const db = await getConnection();
    const cache = db.collection(CACHE_DB);
    cache.update({ _id: item._id }, { $set: { lastUse: new Date() }, $inc: { used: 1 } });
}

export function createCacheKey(metrica: Metrica, conceptId: ConceptId, periodo: Periodo, params: Params, group: GroupList) {
    const start = '' + periodo.start.toDate().getTime();
    const end = periodo.end ? '' + periodo.end.toDate().getTime() : 'null';
    const groupKey = group ? group.join('-') : 'null';

    const queries = FILTER_AVAILABLE.reduce((acc, current) => {
        if (params[current.name]) {
            return acc + params[current.name] + '|'
        }
        return acc + 'null|';
    }, '');

    const key = `${metrica}|${conceptId}|${start}|${end}|${queries}|${groupKey}`;
    return key;
}

export async function restoreFromCacheV2(metrica: Metrica, conceptsIds: ConceptIds, periodos: PeriodoList, params: Params, group: GroupList) {
    const keys = [];
    conceptsIds.forEach(id => {
        periodos.forEach((periodo) => {
            const key = createCacheKey(metrica, id, periodo, params, group);
            keys.push(key);
        })
    });

    const db = await getConnection();
    const cache = db.collection(CACHE_DB);
    const values = await cache.find({
        hash_key: { $in: keys },
    }).toArray();


    return values.reduce((acc, current) => {
        acc[current.hash_key] = current;
        return acc;
    }, {})
}

export async function storeInCacheV2(metrica: Metrica, conceptId: ConceptId, periodo: Periodo, params: Params, group: GroupList, value: any) {
    const db = await getConnection();
    const cache = db.collection(CACHE_DB);

    const key = createCacheKey(metrica, conceptId, periodo, params, group);

    const cacheObj = {
        hash_key: key,
        value,
        lastUse: new Date(),
        used: 1
    };

    await cache.insert(cacheObj);
}