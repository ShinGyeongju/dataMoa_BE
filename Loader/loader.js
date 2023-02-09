require('../Common/config').init();
require('../Common/logger').init();

const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');


module.exports.init = async (app) => {
  try {
    await expressLoader(app);

    await postgresLoader.dbConnect();

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}