const logger = require('../../Common/logger').toiletLogger;
const toiletModel = require('../Models/toiletModel');
const {createResponseObj, createErrorMetaObj} = require('./commonService');


// Service
module.exports.getToilet = (req, res, next) => {
  res.sendfile();
}

module.exports.getSync = async (req, res, next) => {
  const toiletDataUrl = {
    LOCALDATA_SEOUL: 'https://www.localdata.go.kr/lif/etcDataDownload.do?localCodeEx=6110000&sidoCodeEx=6110000&sigunguCodeEx=&opnSvcIdEx=12_04_01_E&startDateEx=&endDateEx=&fileType=xlsx&opnSvcNmEx=%25EA%25B3%25B5%25EC%25A4%2591%25ED%2599%2594%25EC%259E%25A5%25EC%258B%25A4%25EC%25A0%2595%25EB%25B3%25B4'
  };

  try {
    // TODO: Excel download from localdata


  } catch (err) {

  }

  res.json({test: true});
}
