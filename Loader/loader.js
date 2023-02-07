const path = require('path');
const dotenv = require('dotenv');
const expressLoader = require('./expressLoader');
const postgresLoader = require('./postgresLoader');


module.exports.init = async (app) => {
  dotenv.config({
    path: path.join(__dirname, '../config.env')
  });

  await expressLoader(app);

  // Logger init
  require('../Common/logger');

  //module.exports.postgresClient = await postgresLoader();

}