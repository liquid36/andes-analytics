import * as moment from 'moment';

import { getConnection, MAIN_DB } from './database';
import { TIME_UNIT, FILTER_AVAILABLE } from './util';
import { touchCache, restoreFromCacheV2, createCacheKey, storeInCacheV2 } from './cache';
import { groupReducer, matchConceptExpression } from './queries/helpers';
import { ConceptId, PeriodoList, Params } from '../types';

let date_min = moment('2018-01-01T00:00:00.000-03:00').startOf(TIME_UNIT);
let date_max = moment('2020-08-31T00:00:00.000-03:00').endOf(TIME_UNIT);

async function minmaxDate() {
    const db = await getConnection();
    const list = await db.collection(MAIN_DB).aggregate([{ $group: { _id: null, max: { $max: '$start' }, min: { $min: "$start" } } }]).toArray();
    date_max = moment(list[0].max).endOf(TIME_UNIT);
    date_min = moment(list[0].min).startOf(TIME_UNIT);
}

minmaxDate();

export const execQuery = async function (metrica: string, conceptsIds, filters, group) {
    let cache = {};
    const queryData = require('./queries/' + metrica).QUERY;
    const cacheActive = queryData.cache && !group;
    if (!queryData) {
        throw new Error('Visualization not found!');
    }
    const { start, end, params } = parseFilter(filters);
    const periods = splitTimeline(start, end);

    if (cacheActive) {
        cache = await restoreFromCacheV2(metrica, conceptsIds, periods, params);
    }

    const results = {};
    const ps = conceptsIds.map(async conceptId => {
        const { self, conceptId: concept } = matchConceptExpression(conceptId);
        results[concept] = await execQueryByConcept(queryData, conceptId, periods, cache, params, group);
    });

    await Promise.all(ps);
    return results;
}

async function execQueryByConcept(queryData, conceptId: ConceptId, periodos: PeriodoList, cache, params: Params, group) {

    if (!queryData.query) {
        throw new Error(`Visualization [${queryData.name}] not have query function`);
    }

    const cacheActive = queryData.cache && !group;
    const ps = periodos.map(async periodo => {
        if (periodo.end) {

            return await queryData.query(conceptId, periodo, params, group);

        } else {
            const key = createCacheKey(queryData.name, conceptId, periodo, params);
            const inCache = cache[key];
            if (inCache) {
                touchCache(inCache);
                return inCache.value;
            } else {
                const qs = await queryData.query(conceptId, periodo, params, group);
                if (cacheActive) {
                    storeInCacheV2(queryData.name, conceptId, periodo, params, qs);
                }
                return qs;
            }
        }
    });

    const resultList = await Promise.all(ps);
    let result: any = groupReducer(queryData, resultList);
    if (queryData.transform) {
        result = result.map(item => {
            return {
                _id: item._id,
                label: item.label,
                hashId: item.hashId,
                value: queryData.transform(item.value)
            }
        })
    }
    if (!group) {
        if (result.length > 0) {
            return result[0];
        } else {
            return { _id: '', hashId: '', label: '', value: queryData.transform(queryData.initial()) };
        }
    }
    return result;
}




function getDate(date, type = 'start') {
    if (date) {
        return type === 'start' ? moment(date).startOf('day') : moment(date).endOf('day');
    } else {
        return type === 'start' ? date_min.clone() : date_max.clone();
    }
}

function isStartOf(date, unit = TIME_UNIT) {
    return date.clone().startOf('day').isSame(date.clone().startOf(unit));
}

function isEndOf(date, unit = TIME_UNIT) {
    return date.clone().endOf('day').isSame(date.clone().endOf(unit));
}

function isSamePeriod(start, end, unit = TIME_UNIT) {
    return start.clone().startOf(unit).isSame(end.clone().startOf(unit));
}

function parseFilter(filter) {
    const start = getDate(filter.start, 'start');
    const end = getDate(filter.end, 'end');
    const params: any = {
    };
    FILTER_AVAILABLE.forEach((t: any) => {
        const name = t.name;
        const defaultValue = t.default;
        const transform: any = t.transform || ((v) => v);

        if (filter[name] === undefined || filter[name] === null) {
            params[name] = defaultValue;
        } else {
            params[name] = transform(filter[name]);
        }
    });
    return { start, end, params };
}

function splitTimeline(start, end): PeriodoList {
    const _isStartOf = isStartOf(start);
    const _isEndOf = isEndOf(end);
    const _isSamePeriod = isSamePeriod(start, end);
    const periods = [];

    if (_isSamePeriod) {
        if (_isStartOf && _isEndOf) {
            periods.push({ start });
        } else {
            periods.push({ start, end });
        }
    } else {
        periods.push({ start, end: _isStartOf ? null : start.clone().endOf(TIME_UNIT) });
        if (_isEndOf) {
            periods.push({ start: end.clone().startOf(TIME_UNIT) });
        } else {
            periods.push({ start: end.clone().startOf(TIME_UNIT), end });

        }

        let step = start.clone().add(1, TIME_UNIT).startOf(TIME_UNIT);

        while (!isSamePeriod(step, end)) {
            periods.push({ start: step });
            step = step.clone().add(1, TIME_UNIT).startOf(TIME_UNIT);
        }
    }
    return periods;
}



/**
 * GET max and min date
 db.getCollection('prestaciontx2').aggregate([
     {
         $group:
         {
             _id: null,
             max: { $max: '$start' },
             min: { $min: "$start" }
         }
     }
   ])
 */

