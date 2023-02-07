const datamoaRouter = require('./datamoaRouter');
const {datamoaLogger} = require('../../Common/logger');


module.exports = (app) => {

  // Datamoa page
  app.use('/', datamoaLogger.httpLogger, datamoaRouter);

  // 화장실 위치 찾기 page
  //

  // 복권방 위치 찾기 page
  //

  // Default page
  //app.use()
}