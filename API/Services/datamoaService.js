const logger = require('../../Common/logger').datamoaLogger;
//const datamoaModel = require('../Models/datamoaModel');

module.exports.getDatamoa = (req, res, next) => {
  logger.info('test Log 1');
  next(new Error('test 1111'));

  res.json({result: '1111'});
}

module.exports.getCategory = (req, res, next) => {
  logger.info('test Log 2');

  res.json({result: '2222'});
}

module.exports.getSubpage = (req, res, next) => {

}

module.exports.postVoc = (req, res, next) => {

}
