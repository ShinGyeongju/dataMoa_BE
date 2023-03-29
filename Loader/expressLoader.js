const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');


const cspOptions = {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "script-src": ["'self'", "unsafe-inline", "*.fontawesome.com", "*.naver.com", "*.pstatic.net", "*.googletagmanager.com"],
    "connect-src": ["'self'", "datamoa.kr", "*.fontawesome.com", "*.naver.com", "*.navercorp.com", "*.kakao.com"],
    "img-src": ["'self'", "data:", "*.pstatic.net", "*.navercorp.com"]
  }
};

module.exports = async (app) => {
  // CORS
  app.use(cors());

  // Security header
  app.use(helmet({
    contentSecurityPolicy: cspOptions,
    crossOriginEmbedderPolicy: false
  }));

  // Cookie parser
  app.use(cookieParser());

  // JSON parser
  app.use(express.json());

  // Static file
  app.use(express.static(path.join(__dirname, '../API/Views/build')));
}

module.exports