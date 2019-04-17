const { start, stop } = require('mongo-unit');

const run = async () => {
    await start();
    await stop();
};

run()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });