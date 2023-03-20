require('../Common/config').init();
require('../Common/logger').init();

const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');
const toiletScheduler = require('../Scheduler/toiletScheduler');


module.exports.httpsInit = async (app) => {
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

module.exports.httpInit = async (app) => {
  try {
    app.use((req, res, next) => {
      res.redirect(`https://${req.headers.host}${req.url}`);
    })

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}