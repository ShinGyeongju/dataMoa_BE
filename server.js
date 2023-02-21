const express = require('express');
const loader = require('./Loader/loader');
const router = require('./API/Routes/router');
const {serverConfig} = require('./Common/config');


const startServer = async () => {
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
  app.listen(serverConfig.port, (err) => {
    if (err) {
      console.error(err);
    }

    console.log(`Server is listening at [http://localhost:${serverConfig.port}]`);
  });
}

startServer();
