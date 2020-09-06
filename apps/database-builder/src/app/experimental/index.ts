import { getConceptos } from '../database';
import { getConcepts, getSemanticTagFromFsn } from '../snomed';


async function nextBatch(cursor, n = 30) {
    const BATCH_SIZE = n;
    const items = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
        if (await cursor.hasNext()) {
            const item = await cursor.next()
            items.push(item);
        } else {
            break;
        }
    }
    return items;
}

export async function calcularArbolSnomed() {

    const Conceptos = await getConceptos();

    const conceptos = await Conceptos.aggregate([
        { $match: { 'semanticTag': 'hallazgo' } },
        { $addFields: { listado: { $concatArrays: ['$statedAncestors', ['$conceptId']] } } },
        { $unwind: '$listado' },
        { $group: { _id: '$listado', t: { $sum: 1 } } },
        { $sort: { t: -1 } },
    ]);
    let i = 0;
    while (await conceptos.hasNext()) {
        const items = await nextBatch(conceptos, 100);
        const snomedData = await getConcepts(items.map(i => i._id));

        for (const concepto of snomedData) {

            let rs = (concepto.classAxioms[0] || { relationships: [] }).relationships.filter((r) => r.active && r.characteristicType === 'STATED_RELATIONSHIP' && r.typeId === '116680003').map((r) => {
                return r.target.conceptId
            });

            if (rs.length === 0) {
                rs = concepto.relationships.filter((r) => r.active && r.characteristicType === 'STATED_RELATIONSHIP' && r.typeId === '116680003').map((r) => {
                    return r.target.conceptId
                });
            }

            await Conceptos.updateOne(
                { 'conceptId': concepto.conceptId },
                {
                    $setOnInsert: {
                        semanticTag: getSemanticTagFromFsn(concepto.fsn.term),
                        conceptId: concepto.conceptId,
                        term: concepto.pt.term,
                        fsn: concepto.fsn.term
                    },
                    $set: {
                        parent: rs
                    }
                },
                { upsert: true }
            )
        }
        console.log(i++)

    }


}



/**
db.getCollection('prestacionTx').aggregate([
    { $sort: {  'concepto.conceptId' : 1} },
    { $group: { _id: '$concepto.conceptId', concepto: { $first : '$concepto' } } },
    { $replaceRoot: { newRoot:  '$concepto' } },
    { $out: 'conceptos' }
])


db.getCollection('conceptos').aggregate([
{ $match: { parent: { $exists: true } } },
{ $project: {  _id: 0, conceptId: 1, parent: { $arrayElemAt: [ '$parent', 0 ] }  } }

]).toArray()
 */