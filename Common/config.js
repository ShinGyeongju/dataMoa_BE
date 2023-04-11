const dotenv = require('dotenv');
const path = require('path');


module.exports.init = () => {
  process.env.NODE_ENV =
    ( process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase().includes('prod') )
      ? 'prod'
      : 'dev';

  const configPath = process.env.NODE_ENV  === 'prod'
    ? path.join(__dirname, '../config.env')
    : path.join(__dirname, '../dev.config.env');

  dotenv.config({
    path: path.join(configPath)
  });


  module.exports.serverConfig = {
    httpPort: process.env.HTTP_PORT,
    httpsPort: process.env.HTTPS_PORT,
    apiAuthSecret: process.env.API_AUTH_SECRET
  }

  module.exports.mongoConfig_Log = {
    address: process.env.MONGO_LOG_ADDRESS,
    port: process.env.MONGO_LOG_PORT,
    user: process.env.MONGO_LOG_USER,
    password: process.env.MONGO_LOG_PASSWORD
  }

  module.exports.postgresConfig_Datamoa = {
    address: process.env.POSTGRES_DATAMOA_ADDRESS,
    port: process.env.POSTGRES_DATAMOA_PORT,
    database: process.env.POSTGRES_DATAMOA_DATABASE,
    user: process.env.POSTGRES_DATAMOA_USER,
    password: process.env.POSTGRES_DATAMOA_PASSWORD
  }

  module.exports.postgresConfig_Toilet = {
    address: process.env.POSTGRES_TOILET_ADDRESS,
    port: process.env.POSTGRES_TOILET_PORT,
    database: process.env.POSTGRES_TOILET_DATABASE,
    user: process.env.POSTGRES_TOILET_USER,
    password: process.env.POSTGRES_TOILET_PASSWORD
  }

  module.exports.postgresConfig_Toto = {
    address: process.env.POSTGRES_TOTO_ADDRESS,
    port: process.env.POSTGRES_TOTO_PORT,
    database: process.env.POSTGRES_TOTO_DATABASE,
    user: process.env.POSTGRES_TOTO_USER,
    password: process.env.POSTGRES_TOTO_PASSWORD
  }

  module.exports.mailAuth = {
    gmailUser: process.env.GMAIL_USER,
    gmailPassword: process.env.GMAIL_PASSWORD
  }

  module.exports.apiConfig = {
    kakaoMapGeocodeUrl: process.env.KAKAO_MAP_GEOCODE_API_URL,
    kakaoMapReverseGeocodeUrl: process.env.KAKAO_MAP_REVERSE_GEOCODE_API_URL,
    kakaoMapKey: process.env.KAKAO_MAP_API_KEY,
    naverMapGeocodeUrl: process.env.NAVER_MAP_GEOCODE_API_URL,
    naverMapReverseGeocodeUrl: process.env.NAVER_MAP_REVERSE_GEOCODE_API_URL,
    naverMapId: process.env.NAVER_MAP_API_ID,
    naverMapSecret: process.env.NAVER_MAP_API_SECRET
  }

  module.exports.toiletDownloadConfig = [
    {region: '서울특별시', url: process.env.TOILET_EXCEL_URL_SEOUL, number: '02'},
    {region: '부산광역시', url: process.env.TOILET_EXCEL_URL_BUSAN, number: '051'},
    {region: '대구광역시', url: process.env.TOILET_EXCEL_URL_DAEGU, number: '053'},
    {region: '인천광역시', url: process.env.TOILET_EXCEL_URL_INCHEON, number: '032'},
    {region: '광주광역시', url: process.env.TOILET_EXCEL_URL_GWANGJU, number: '062'},
    {region: '대전광역시', url: process.env.TOILET_EXCEL_URL_DAEJEON, number: '042'},
    {region: '울관광역시', url: process.env.TOILET_EXCEL_URL_ULSAN, number: '052'},
    {region: '세종특별자치시', url: process.env.TOILET_EXCEL_URL_SEJONG, number: '044'},
    {region: '경기도', url: process.env.TOILET_EXCEL_URL_GYEONGGI, number: '031'},
    {region: '강원도', url: process.env.TOILET_EXCEL_URL_GANGWON, number: '033'},
    {region: '충청북도', url: process.env.TOILET_EXCEL_URL_CHUNGBUK, number: '043'},
    {region: '충청남도', url: process.env.TOILET_EXCEL_URL_CHUNGNAM, number: '041'},
    {region: '전라북도', url: process.env.TOILET_EXCEL_URL_JEONBUK, number: '063'},
    {region: '전라남도', url: process.env.TOILET_EXCEL_URL_JEONNAM, number: '061'},
    {region: '경상북도', url: process.env.TOILET_EXCEL_URL_GYEONGBUK, number: '054'},
    {region: '경상남도', url: process.env.TOILET_EXCEL_URL_GYEONGNAM, number: '055'},
    {region: '제주특별자치도', url: process.env.TOILET_EXCEL_URL_JEJU, number: '064'}
  ]

  module.exports.totoApiConfig = {
    dhlotteryCrawlUrl: process.env.TOTO_DHLOTTERY_CRAWL_URL,
    dhlotteryApiUrl: process.env.TOTO_DHLOTTERY_API_URL,
    sportstotoCrawlUrl: process.env.TOTO_SPORTSTOTO_CRAWL_URL
  }

}
