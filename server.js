const express = require('express');
const http = require('http');
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

  const httpApp = express();
  const httpsApp = express();

  // Initialize
  const httpInitialized = await loader.httpInit(httpApp);
  const httpsInitialized = await loader.httpsInit(httpsApp);
  if (!httpInitialized && !httpsInitialized) {
    console.log('Initialize failed');
    return;
  }

  // Route
  router(httpsApp);

  // Listen
  http.createServer(httpApp).listen(serverConfig.httpPort, (err) => {
    if (err) {
      console.error(err);
    }

    console.log(`Server is listening on [http://localhost:${serverConfig.httpPort}]`);
  });

  https.createServer(httpsOptions, httpsApp).listen(serverConfig.httpsPort, (err) => {
    if (err) {
      console.error(err);
    }

    //process.send('ready');
    console.log(`Server is listening on [https://localhost:${serverConfig.httpsPort}]`);
  });
}

startServer();


// TODO: 문의 요청이 오면 지정된 메일을 자동으로 전송해주는 기능 구현 필요.
