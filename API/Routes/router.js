const commonService = require('../Services/commonService');
const datamoaRouter = require('./datamoaRouter');
const toiletRouter = require('./toiletRouter');
const logger = require('../../Common/logger');


module.exports = (app) => {
  // Datamoa page
  app.use('/', logger.datamoaLogger.httpLogger, commonService.HMACAuthorization, datamoaRouter);

  // Toilet page
  app.use('/toilet/', logger.toiletLogger.httpLogger, commonService.HMACAuthorization, toiletRouter);

  // TODO: 복권방 위치 찾기 page 추가 예정.
  //

  // Default page
  app.use(commonService.defaultPage);

  // Default error handler
  app.use(commonService.defaultErrorHandler);
}