const express = require('express');
const https = require('https');
const fs = require('fs');
const loader = require('./Loader/loader');
const router = require('./API/Routes/router');
const {serverConfig} = require('./Common/config');
const path = require("path");


const startServer = async () => {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'Cert/datamoa.kr.key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'Cert/datamoa.kr.crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'Cert/ca-chain-bundle.pem')),
    minVersion: 'TLSv1.2'
  }

  const app = express();

  // Initialize
  const isInitialized = await loader.init(app);
  if (!isInitialized) {
    console.log('Initialize failed');
    return;
  }

  // Route
  router(app);

  // Listen
  https.createServer(httpsOptions, app).listen(serverConfig.port, (err) => {
    if (err) {
      console.error(err);
    }

    console.log(`Server is listening at [https://localhost:${serverConfig.port}]`);
  });

}

const server = startServer();


// TODO: 화장실 지번 주소를 우선적으로 사용하여 좌표를 얻었는데, 도로명 주소가 잘못 됐고 지번 주소가 정확한 경우.
// TODO: 화장실 지번 주소가 없어 도로명 주소를 사용하여 좌표를 얻었는데, 도로명 주소가 정확하지 않은 경우.
// TODO: MongoDB 데이터 양 관리 필요.
// TODO: Init SQL에서 [create database if not exists] 기능 구현 필요.
