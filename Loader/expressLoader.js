const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

module.exports = async (app) => {
  // CORS
  app.use(cors());

  // Security header
  app.use(helmet());

  // Cookie parser
  app.use(cookieParser());

  // JSON parser
  app.use(express.json());

  // Static file
  app.use(express.static(path.join(__dirname, '../API/Views/Public')));

  // HTTP log
  // process.env.NODE_ENV = 'production';
  // if (process.env.NODE_ENV === 'production') {
  //   app.use(morgan('combined', {stream: logger.stream}));
  // } else {
  //   app.use(morgan('dev'));
  // }

}