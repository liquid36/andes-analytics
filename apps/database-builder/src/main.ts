

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
        await run();
        // await calcularArbolSnomed();
    }
    process.exit();
}

main();