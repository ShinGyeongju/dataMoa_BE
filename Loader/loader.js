require('../Common/config').init();
require('../Common/logger').init();

const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');
const scheduler = require('../Scheduler/scheduler');


module.exports.httpsInit = async (app) => {
  try {
    await expressLoader(app);

    await postgresLoader.dbConnect(postgresLoader.datamoaDB);
    await postgresLoader.dbConnect(postgresLoader.toiletDB);
    await postgresLoader.dbConnect(postgresLoader.totoDB);

    await scheduler.init();

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