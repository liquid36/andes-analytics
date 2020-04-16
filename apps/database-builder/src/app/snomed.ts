import { environment } from '../environments/environment';

const request = require('request-promise-native');


export async function getConcepts(conceptsId) {
    const options = {
        uri: `${environment.SNOWSTORM_HOST}/browser/${environment.SNOMED_COLLECTION}/concepts`,
        headers: {
            "Accept": "application/json",
            "Accept-Language": "es"
        },
        qs: { conceptIds: conceptsId, number: 0, size: 1000 },
        useQuerystring: true,
        json: true
    };
    const { items } = await request(options);
    return items;
}

const cacheSnomed = {};

function getSemanticTagFromFsn(fsn: String) {
    const startAt = fsn.lastIndexOf('(');
    const endAt = fsn.lastIndexOf(')');
    return fsn.substring(startAt + 1, endAt);
}

export async function findSnomed(ids) {

    const realFind = ids.filter(ctid => {
        return !cacheSnomed[ctid];
    });

    if (realFind.length > 0) {
        let concepts = await getConcepts(realFind);

        concepts = concepts.items.map(c => {

            return {
                "semanticTag": getSemanticTagFromFsn(c.fsn.term),
                "fsn": c.fsn.term,
                "term": c.pt.term,
                "conceptId": c.conceptId,
                "inferredAncestors": getRelationship(c, 'INFERRED_RELATIONSHIP'),
                "statedAncestors": getRelationship(c, 'STATED_RELATIONSHIP')
            }
        })

        concepts.forEach(c => cacheSnomed[c.conceptId] = c);
    }
}

export function getConcept(conceptId) {
    return cacheSnomed[conceptId];
}

export function toDBStore(concept) {
    return {
        "semanticTag": getSemanticTagFromFsn(concept.fsn.term),
        "fsn": concept.fsn.term,
        "term": concept.pt.term,
        "conceptId": concept.conceptId,
        "inferredAncestors": getRelationship(concept, 'INFERRED_RELATIONSHIP'),
        "statedAncestors": getRelationship(concept, 'STATED_RELATIONSHIP')
    }
}

function getRelationship(concept, type) {
    return concept.relationships.filter(r => {
        return r.typeId === '116680003' && r.active === true && r.characteristicType === type
    }).map(r => r.target.conceptId);
}
