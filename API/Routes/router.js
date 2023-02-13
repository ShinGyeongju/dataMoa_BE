const commonService = require('../Services/commonService');
const datamoaRouter = require('./datamoaRouter');
const {datamoaLogger} = require('../../Common/logger');


module.exports = (app) => {
  // Datamoa page
  app.use('/', datamoaLogger.httpLogger, datamoaRouter, );

  // TODO: 화장실 위치 찾기 page 추가 예정.
  //

  // TODO: 복권방 위치 찾기 page 추가 예정.
  //

  // Default page
  app.use(commonService.defaultPage);

  // Default error handler
  app.use(commonService.defaultErrorHandler);
}