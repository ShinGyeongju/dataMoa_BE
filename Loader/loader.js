require('../Common/config').init();
require('../Common/logger').init();

const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');
const toiletScheduler = require('../Scheduler/toiletScheduler');


module.exports.init = async (app) => {
  try {
    await expressLoader(app);

    await postgresLoader.dbConnect(postgresLoader.datamoaDB);
    await postgresLoader.dbConnect(postgresLoader.toiletDB);

    await toiletScheduler.init();

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}