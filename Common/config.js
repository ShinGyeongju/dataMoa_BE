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

  module.exports.mongoConfig = {
    url: process.env.MONGO_URL
  }

  module.exports.postgresConfig = {
    address: process.env.POSTGRES_ADDRESS,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  }

}
