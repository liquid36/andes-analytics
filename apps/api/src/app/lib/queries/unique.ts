import { getConnection, MAIN_DB } from '../database';
import { makeBasePipeline, createAddOn, createIdMetadata, hash, createLabelMetadata } from './helpers';
import { ConceptId, Periodo, Params } from '../../types';

async function query(conceptId: ConceptId, periodo: Periodo, params: Params, group) {
    const db = await getConnection();
    const PrestacionesTx = db.collection(MAIN_DB);
    const { pipeline } = makeBasePipeline(conceptId, periodo, params, { forceUnwind: true });

    const metadataID = createIdMetadata(group);
    const addOns = group ? createAddOn(group, params) : [];

    const $pipeline = [
        ...pipeline,
        ...addOns,
        {
            $group: {
                ...metadataID,
                value: { $addToSet: { $toString: '$registros.paciente.id' } }
            }
        },
        {
            $project: {
                _id: 1,
                label: createLabelMetadata(group),
                value: 1
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

const initial = () => new Set()

const reducer = (acc, value) => {
    const set = new Set([...acc, ...value]);
    return [...set];
};

const transform = (value) => value.length

export const QUERY = {
    name: 'unique',
    query,
    reducer,
    initial,
    transform,
    cache: true,
    unwind: true,
    split: true
}