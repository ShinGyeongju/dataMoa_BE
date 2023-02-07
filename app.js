const express = require('express');
const loader = require('./Loader/loader');

const serverListen = async () => {
  const app = express();

  // Initialize
  try {
    await loader.init(app);
  } catch (err) {
    console.error(err);
    return;
  }

  // Routing
  const router = require('./API/Routes/router');
  router(app);

  // Listen
  app.listen(process.env.HTTP_PORT, (err) => {
    if (err) {
      console.error(err);
    }

    console.log(`Server is listening at [http://localhost:${process.env.HTTP_PORT}]`);
  })
}

serverListen();
