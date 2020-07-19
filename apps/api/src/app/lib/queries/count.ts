import { getConnection, MAIN_DB } from '../database';
import { makeBasePipeline, createAddOn, createIdMetadata, hash, createLabelMetadata } from './helpers';
import { ConceptId, Periodo, Params } from '../../types';

async function query(conceptId: ConceptId, periodo: Periodo, params: Params, group) {
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);

    const { pipeline, needUnwind } = makeBasePipeline(conceptId, periodo, params, { forceUnwind: !!group });
    const metadataID = createIdMetadata(group);
    const addOns = group ? createAddOn(group, params) : [];

    const countKey = needUnwind ? 1 : '$total';

    const $pipeline = [
        ...pipeline,
        ...addOns,
        {
            $group: {
                ...metadataID,
                total: { $sum: countKey },
                exact: {
                    $sum: {
                        $cond: { if: { $eq: ['$concepto.conceptId', conceptId] }, then: countKey, else: 0 }
                    }
                }
            },
        },
        {
            $project: {
                _id: 1,
                label: createLabelMetadata(group),
                value: {
                    total: '$total',
                    exact: '$exact'
                }
            }
        }
    ];
    const results = await PrestacionesTx.aggregate($pipeline, { allowDiskUse: true }).toArray();
    results.forEach(r => {
        r.hashId = hash(r._id);
    });
    return results;
}

const initial = () => ({
    exact: 0,
    total: 0
})

const reducer = (acc, value) => {
    return {
        total: acc.total + value.total,
        exact: acc.exact + value.exact
    };
}

const transform = (value) => {
    return {
        exact: value.exact,
        total: value.total,
        children: value.total - value.exact
    }
};


export const QUERY = {
    name: 'count',
    query,
    reducer,
    initial,
    transform,
    cache: true,
    unwind: false,
    split: true
}