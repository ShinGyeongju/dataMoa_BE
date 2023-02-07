const logger = require('../../Common/logger').datamoaLogger;

module.exports.getDatamoa = (req, res, next) => {
  logger.error('test Log');

  res.json({result: 'ttttttt1234'});
}

module.exports.getCategory = (req, res, next) => {

}

module.exports.getSubpage = (req, res, next) => {

}

module.exports.postVoc = (req, res, next) => {

}