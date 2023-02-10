const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');
const {serverConfig, mongoConfig_Log} = require('../Common/config');


module.exports.init = () => {
  // Custom format
  const customTransportFormat_MongoDB_Info = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss', alias: 'timestamp_kr'}),
    winston.format.metadata({fillWith: ['timestamp_kr']}),
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

  const customMorganFormat = ':method :url [:remote-addr - :remote-user] :status - :response-time ms';

  // Create transport object
  const createTransportObj_MongoDB = (level, collection, format) => {
    return new winston.transports.MongoDB({
      level: level,
      db: mongoConfig_Log.url,
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


  if (serverConfig.env !== 'dev') {
    datamoaLogger.add(createTransportObj_MongoDB('info', 'datamoa', customTransportFormat_MongoDB_Info));
    datamoaLogger.add(createTransportObj_MongoDB('error', 'datamoa_error', customTransportFormat_MongoDB_Error));
  }

  module.exports.datamoaLogger = datamoaLogger;
}