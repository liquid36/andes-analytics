import { environment } from '../environments/environment';

const request = require('request-promise-native');

import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch'

const client = new Client({ node: environment.ELASTICSEARCH_HOST })

export async function getConceptsAncestors(conceptsIds) {
    const conceptIdForm = [];
    conceptsIds.forEach((concepto) => {
        conceptIdForm.push(concepto + '_s');
        conceptIdForm.push(concepto + '_i');
    })

    const searchParams: RequestParams.Search<any> = {
        index: 'semantic',
        type: 'queryconcept',
        size: 1000,
        body: {
            query: {
                bool: {
                    must: [
                        branchesClause,
                        { terms: { conceptIdForm: conceptIdForm } }
                    ]
                }
            }
        }
    }

    const response = await client.search(searchParams);
    const items = response.body.hits.hits;
    const mapping = {};
    items.forEach((elem) => {
        elem = elem._source;
        const id = elem.conceptIdForm.slice(0, -2);
        if (!mapping[id]) { mapping[id] = {} };
        if (elem.stated) {
            mapping[id].statedAncestors = elem.ancestors;
        } else {
            mapping[id].inferredAncestors = elem.ancestors;
        }
    })
    return mapping;
}

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


function getBranches() {
    let branchName: string = environment.SNOMED_COLLECTION;
    let index = branchName.indexOf('/');
    const branches = [];
    while (index >= 0) {
        const branch = branchName.substring(0, index);
        branches.push(branch);

        index = branchName.indexOf('/', index + 1);
        // branchName = branchName.substr(index + 1);
    }
    branches.push(branchName);

    return branches;
}


function branchFilterClause() {
    const branches = getBranches();

    const branchClause = branches.map(b => ({ term: { path: b } }));

    return { bool: { should: branchClause } };
}

const branchesClause = branchFilterClause();