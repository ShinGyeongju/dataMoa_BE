const commonService = require('../Services/commonService');
const datamoaRouter = require('./datamoaRouter');
const toiletRouter = require('./toiletRouter');
const totoRouter = require('./totoRouter');
const logger = require('../../Common/logger');


module.exports = (app) => {
  // Toto page
  app.use('/toto/', logger.totoLogger.httpLogger, totoRouter);

  // Toilet page
  app.use('/toilet/', logger.toiletLogger.httpLogger, toiletRouter);

  // Datamoa page
  app.use('/', logger.datamoaLogger.httpLogger, datamoaRouter);

  // Default page
  app.use(commonService.defaultPage);

  // Default error handler
  app.use(commonService.defaultErrorHandler);
}