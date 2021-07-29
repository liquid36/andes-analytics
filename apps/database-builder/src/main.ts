import * as moment from "moment";


require('dotenv').config();
const { run } = require('./app');

// const { calcularArbolSnomed } = require("./app/experimental");

const { createMetaindex, createConceptosNumericos, populateConceptos } = require('./app/metaindex');


async function main() {
    const index = process.argv[2];
    if (index && index === '--index') {
        await Promise.all([
            createMetaindex(),
            createConceptosNumericos(),
            populateConceptos()
        ]);
    } else {
        const fechaMin = moment(process.argv[2], 'YYYYMMDD').startOf('M').toDate();
        const fechaMax = moment(process.argv[3], 'YYYYMMDD').endOf('M').toDate();;
        await run(fechaMin, fechaMax);
        // await calcularArbolSnomed();
    }
    process.exit();
}

main();