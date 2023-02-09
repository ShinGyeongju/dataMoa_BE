const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

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

}