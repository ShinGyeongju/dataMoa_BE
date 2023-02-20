const {Pool} = require('pg');
const {postgresConfig_Datamoa, postgresConfig_Toilet} = require('../Common/config');


// Postgres pool
const postgresClient_Datamoa = new Pool({
  host: postgresConfig_Datamoa.address,
  port: postgresConfig_Datamoa.port,
  database: postgresConfig_Datamoa.database,
  user: postgresConfig_Datamoa.user,
  password: postgresConfig_Datamoa.password,
});

const postgresClient_Toilet = new Pool({
  host: postgresConfig_Toilet.address,
  port: postgresConfig_Toilet.port,
  database: postgresConfig_Toilet.database,
  user: postgresConfig_Toilet.user,
  password: postgresConfig_Toilet.password,
});

// Connection test
module.exports.dbConnect_Datamoa = async (pgClient) => {
  await new Promise((resolve, reject) => {
    pgClient.connect(err => {
      if (err) {
        console.log('[Datamoa] Connect to postgres failed.');
        reject(err);
      } else {
        console.log('[Datamoa] Connect to postgres done.');
        resolve();
      }
    });
  });
}


// TODO: Pool을 바로 제공하지 않고, Query할 떄 마다 Pool의 Client를 제공하도록 수정 필요.
module.exports.datamoaDB = postgresClient_Datamoa;
module.exports.toiletDB = postgresClient_Toilet;