const {defaultPage, defaultErrorHandler} = require('../Services/commonService');
const datamoaRouter = require('./datamoaRouter');
const {datamoaLogger} = require('../../Common/logger');


module.exports = (app) => {

  // Datamoa page
  app.use('/', datamoaLogger.httpLogger, datamoaRouter, );
  // app.use('/', (err, req, res, next) => {
  //   console.log('Default PAGE !!@#@!#!@');
  // });

  // TODO: 화장실 위치 찾기 page
  //

  // TODO: 복권방 위치 찾기 page
  //

  // Default page
  app.use(defaultPage);

  // Default error handler
  app.use(defaultErrorHandler);

}