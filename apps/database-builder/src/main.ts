require('dotenv').config();
const { run } = require('./app');

const { createMetaindex, createConceptosNumericos } = require('./app/metaindex');


async function main() {
    const index = process.argv[2];
    if (index && index === '--index') {
        await Promise.all([
            createMetaindex(),
            createConceptosNumericos()
        ]);
    } else {
        await run();
    }
    process.exit();
}

main();