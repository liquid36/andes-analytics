import { getSnomed } from './database';

const cacheSnomed = {};

export async function findSnomed(ids) {
    const snomedCollection = await getSnomed();

    const realFind = ids.filter(ctid => {
        return !cacheSnomed[ctid];
    });

    if (realFind.length > 0) {
        const concepts: any[] = await snomedCollection.find({ conceptId: { $in: realFind } }).toArray();
        concepts.forEach(c => cacheSnomed[c.conceptId] = c);
    }
}

export function getConcept(conceptId) {
    return cacheSnomed[conceptId];
}