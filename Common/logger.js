const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');
const {serverConfig, mongoConfig_Log} = require('../Common/config');


module.exports.init = () => {
  // Custom format
  const customTransportFormat_MongoDB_Info = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss', alias: 'timestamp_kr'}),
    winston.format.metadata({fillWith: ['timestamp_kr', 'result']}),
    winston.format.json()
  );

  const customTransportFormat_MongoDB_Error = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss', alias: 'timestamp_kr'}),
    winston.format.metadata({fillWith: ['timestamp_kr', 'code', 'stack']}),
    winston.format.json()
  );

  const customTransportFormat_Console = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
  )

  const customMorganFormat = ':method :url (:remote-addr) :status - :response-time ms';

  // Create transport object
  const createTransportObj_MongoDB = (level, collection, format) => {
    return new winston.transports.MongoDB({
      level: level,
      // mongodb://root:1234@localhost:27017
      db: `mongodb://${mongoConfig_Log.user}:${mongoConfig_Log.password}@${mongoConfig_Log.address}:${mongoConfig_Log.port}`,
      options: {
        useUnifiedTopology: true
      },
      dbName: 'Logs',
      collection: collection,
      format: format
    });
  }

  const createTransportObj_Console = () => {
    return new winston.transports.Console({
      format: customTransportFormat_Console
    });
  }

  // Logger
  const datamoaLogger = winston.createLogger({
    transports: [
      createTransportObj_Console()
    ]
  });

  datamoaLogger.httpLogger = morgan(customMorganFormat, {
    stream: {
      write: message => {
        datamoaLogger.info(message);
      }
    }
  });

  const toiletLogger = winston.createLogger({
    transports: [
      createTransportObj_Console()
    ]
  });

  toiletLogger.httpLogger = morgan(customMorganFormat, {
    stream: {
      write: message => {
        toiletLogger.info(message);
      }
    }
  });

  if (serverConfig.env !== 'dev') {
    datamoaLogger.add(createTransportObj_MongoDB('info', 'datamoa', customTransportFormat_MongoDB_Info));
    datamoaLogger.add(createTransportObj_MongoDB('error', 'datamoa_error', customTransportFormat_MongoDB_Error));
    toiletLogger.add(createTransportObj_MongoDB('info', 'toilet', customTransportFormat_MongoDB_Info));
    toiletLogger.add(createTransportObj_MongoDB('error', 'toilet_error', customTransportFormat_MongoDB_Error));
  }

  module.exports.datamoaLogger = datamoaLogger;
  module.exports.toiletLogger = toiletLogger;
}
