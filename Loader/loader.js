require('../Common/config').init();
require('../Common/logger').init();

const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');


module.exports.init = async (app) => {
  try {
    await expressLoader(app);

    //module.exports.postgresClient = await postgresLoader();

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}