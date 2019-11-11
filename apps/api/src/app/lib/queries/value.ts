import { getConnection, MAIN_DB } from '../database';
import { makeBasePipeline, createAddOn, createIdMetadata, hash, createLabelMetadata } from './helpers';

async function query(conceptId, perdiodo, params, group) {
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);
    const { pipeline } = makeBasePipeline(conceptId, perdiodo, params, { forceUnwind: true });

    const metadataID = createIdMetadata(group);
    const addOns = group ? createAddOn(group, params) : [];

    const $pipeline = [
        ...pipeline,
        ...addOns,
        {
            $match: {
                'registros.valorType': 'number',
                'registros.valor': { $ne: null }
            }
        },
        {
            $group: {
                ...metadataID,
                count: { $sum: 1 },
                sum: { $sum: '$registros.valor' }

            }
        },
        {
            $project: {
                _id: 1,
                label: createLabelMetadata(group),
                value: {
                    count: '$count',
                    sum: '$sum'
                }
            }
        }
    ];
    const results = await PrestacionesTx.aggregate($pipeline, { allowDiskUse: true }).toArray();
    results.forEach(r => {
        r.hashId = hash(r._id);
        r.value = r.value;
    });
    return results;
}

const initial = () => ({ count: 0, sum: 0 })

const reducer = (a, b) => {
    return {
        count: a.count + b.count,
        sum: a.sum + b.sum
    }
};

const transform = (value) => {
    if (value.count > 0) {
        return value.sum / value.count;
    }
    return 0;
}

export const QUERY = {
    name: 'value',
    query,
    reducer,
    initial,
    transform,
    cache: true,
    unwind: true,
    split: true
}