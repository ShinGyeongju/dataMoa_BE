const morgan = require('morgan');
const winston = require('winston');
require('winston-mongodb');


// Custom format
const customTransportFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss', alias: 'timestamp_kr'}),
  winston.format.metadata({fillWith: ['timestamp_kr']}),
  winston.format.json()
);

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
    collection: collection
  });
}

const createTransportObj_Console = () => {
  return new winston.transports.Console();
}

// Logger
const datamoaLogger = winston.createLogger({
  format: customTransportFormat,
  transports: [
    createTransportObj_MongoDB('info', 'datamoa'),
    createTransportObj_MongoDB('error', 'datamoa_error'),
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


module.exports.datamoaLogger = datamoaLogger;
