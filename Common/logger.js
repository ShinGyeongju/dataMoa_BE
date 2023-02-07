const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');


// Custom format
const customTransportFormat_MongoDB = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss', alias: 'timestamp_kr'}),
  winston.format.metadata({fillWith: ['timestamp_kr']}),
  winston.format.json()
);

const customTransportFormat_Console = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
)

const customMorganFormat = ':method :url [:remote-addr - :remote-user] :status - :response-time ms';

// Create transport object
const createTransportObj_MongoDB = (level, collection) => {
  return new winston.transports.MongoDB({
    level: level,
    db: process.env.MONGO_URL,
    options: {
      useUnifiedTopology: true
    },
    dbName: 'Logs',
    collection: collection,
    format: customTransportFormat_MongoDB
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


if (process.env.NODE_ENV !== 'dev') {
  datamoaLogger.add(createTransportObj_MongoDB('info', 'datamoa'));
  datamoaLogger.add(createTransportObj_MongoDB('error', 'datamoa_error'));
}


module.exports.datamoaLogger = datamoaLogger;
