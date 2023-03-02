const dotenv = require('dotenv');
const path = require('path');


module.exports.init = () => {
  dotenv.config({
    path: path.join(__dirname, '../config.env')
  });

  module.exports.serverConfig = {
    env: process.env.NODE_ENV,
    port: process.env.HTTP_PORT
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
    {region: '서울특별시', url: process.env.TOILET_EXCEL_URL_SEOUL},
    {region: '부산광역시', url: process.env.TOILET_EXCEL_URL_BUSAN},
    {region: '대구광역시', url: process.env.TOILET_EXCEL_URL_DAEGU},
    {region: '인천광역시', url: process.env.TOILET_EXCEL_URL_INCHEON},
    {region: '광주광역시', url: process.env.TOILET_EXCEL_URL_GWANGJU},
    {region: '대전광역시', url: process.env.TOILET_EXCEL_URL_DAEJEON},
    {region: '울관광역시', url: process.env.TOILET_EXCEL_URL_ULSAN},
    {region: '세종특별자치시', url: process.env.TOILET_EXCEL_URL_SEJONG},
    {region: '경기도', url: process.env.TOILET_EXCEL_URL_GYEONGGI},
    {region: '강원도', url: process.env.TOILET_EXCEL_URL_GANGWON},
    {region: '충청북도', url: process.env.TOILET_EXCEL_URL_CHUNGBUK},
    {region: '충청남도', url: process.env.TOILET_EXCEL_URL_CHUNGNAM},
    {region: '전라북도', url: process.env.TOILET_EXCEL_URL_JEONBUK},
    {region: '전라남도', url: process.env.TOILET_EXCEL_URL_JEONNAM},
    {region: '경상북도', url: process.env.TOILET_EXCEL_URL_GYEONGBUK},
    {region: '경상남도', url: process.env.TOILET_EXCEL_URL_GYEONGNAM},
    {region: '제주특별자치도', url: process.env.TOILET_EXCEL_URL_JEJU}
  ]

}
