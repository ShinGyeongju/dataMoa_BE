const dotenv = require('dotenv');
const path = require('path');


module.exports.init = () => {
  dotenv.config({
    path: path.join(__dirname, '../config.env')
  });

  module.exports.serverConfig = {
    env: process.env.NODE_ENV,
    port: process.env.HTTP_PORT
  }

  module.exports.mongoConfig_Log = {
    address: process.env.MONGO_LOG_ADDRESS,
    port: process.env.MONGO_LOG_PORT,
    user: process.env.MONGO_LOG_USER,
    password: process.env.MONGO_LOG_PASSWORD
  }

  module.exports.postgresConfig_Datamoa = {
    address: process.env.POSTGRES_DATAMOA_ADDRESS,
    port: process.env.POSTGRES_DATAMOA_PORT,
    database: process.env.POSTGRES_DATAMOA_DATABASE,
    user: process.env.POSTGRES_DATAMOA_USER,
    password: process.env.POSTGRES_DATAMOA_PASSWORD
  }

}
