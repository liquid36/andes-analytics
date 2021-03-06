import * as base64 from 'base-64';
import { FILTER_AVAILABLE, TIME_UNIT, getFilterField } from '../util';
import { ConceptId, Params, Periodo } from '../../types';


export function matchConceptExpression(conceptId: ConceptId) {
    const self = conceptId.startsWith('!');
    const concept = self ? conceptId.substr(1) : conceptId;
    return { self, conceptId: concept };
}

export function selfOrDescendant(conceptId, type, self) {
    const $or: any[] = [
        { 'concepto.conceptId': conceptId },
    ]
    if (!self) {
        if (type === 'stated') {
            $or.push({ 'concepto.statedAncestors': conceptId });
        } else {
            $or.push({ 'concepto.inferredAncestors': conceptId });
        }
    }
    return $or;
}

export function initialMatch(conceptId, type, periodo, self) {
    if (periodo.end) {
        return {
            $or: selfOrDescendant(conceptId, type, self),
            start: periodo.start.clone().startOf(TIME_UNIT).toDate()
        };
    } else {
        return {
            $or: selfOrDescendant(conceptId, type, self),
            start: periodo.start.toDate()
        };
    }
}

export function makeBasePipeline(concept: ConceptId, periodo: Periodo, params: Params, options: any = {}) {
    const { forceUnwind } = options;
    const { self, conceptId } = matchConceptExpression(concept);

    const $match = initialMatch(conceptId, params.type, periodo, self);
    const $unwindMatch = {}
    const extrasStage = [];

    FILTER_AVAILABLE.forEach(filter => {
        const name = filter.name;
        const isQueriable = filter.query;

        if (isQueriable && params[name] && filter.field) {
            const value = filter.transform ? filter.transform(params[name]) : params[name];
            $match[filter.field] = value;
            if (filter.unwind) {
                $unwindMatch[filter.field] = value;
            }
        }
    });


    const needUnwind = Object.keys($unwindMatch).length > 0 || forceUnwind || periodo.end;
    if (needUnwind) {
        if (periodo.end) {
            $unwindMatch['registros.fecha'] = { $gte: periodo.start.toDate(), $lte: periodo.end.toDate() };
        }
        extrasStage.push({ $unwind: '$registros' });
        extrasStage.push({ $match: $unwindMatch });
    }

    return {
        pipeline: [
            { $match: $match },
            ...extrasStage,
        ],
        needUnwind
    };
}

export function addOnQueryEdad(metadata, params) {
    const bucketField = `docs.${metadata.field}`;
    const $addFields = {};
    $addFields[bucketField] = '$_id';

    return [
        {
            $bucket: {
                groupBy: `$${metadata.field}`,
                boundaries: params.rangoEtario,
                default: 100,
                output: {
                    "docs": { $push: "$$ROOT" },
                }
            }
        },
        { $unwind: '$docs' },
        { $addFields },
        { $replaceRoot: { newRoot: '$docs' } }
    ]
}


export function createIdMetadata(groups) {
    if (groups) {
        const label = {}
        const _id = {};
        groups.forEach(groupBy => {
            const metadata = getFilterField(groupBy);
            _id[groupBy] = '$' + metadata.field;
            label['label_' + groupBy] = { $first: '$' + metadata.label };
        });
        return {
            _id, ...label
        };
    } else {
        return {
            _id: ''
        };
    }
}

export function createLabelMetadata(groups) {
    if (groups) {
        const label = {}
        groups.forEach(groupBy => {
            label[groupBy] = '$label_' + groupBy;
        });
        return label;
    } else {
        return 1;
    }
}

const addOnField = {
    // 'decada': addOnQueryEdad
    fecha (metadata, params) {
        return [
            { 
                $addFields: {   
                    'registros.fecha': {
                        $dateToString: { date: '$registros.fecha', format: '%Y-%m' }
                    }
                } 
            }
        ]
    }
}

export function createAddOn(groups, params) {
    let extras = [];
    groups.forEach(groupBy => {
        if (addOnField[groupBy]) {
            const metadata = getFilterField(groupBy);
            const addons = addOnField[groupBy](metadata, params);
            extras = [...extras, ...addons];
        }
    });
    return extras;
}

export function hash(id) {
    return base64.encode(JSON.stringify(id));
}

export function groupReducer(metadata, resultados) {
    const mapping = {};
    resultados.forEach((bucket) => {
        bucket.forEach(item => {
            if (!mapping[item.hashId]) {
                mapping[item.hashId] = item;
                mapping[item.hashId].value = metadata.reducer(metadata.initial(), item.value);
            } else {
                mapping[item.hashId].value = metadata.reducer(mapping[item.hashId].value, item.value)
            }
        })
    });
    return Object.values(mapping);
}