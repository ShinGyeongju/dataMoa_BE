const {Pool} = require('pg');
const {postgresConfig_Datamoa, postgresConfig_Toilet, postgresConfig_Toto} = require('../Common/config');


// Postgres pool
const postgresClient_Datamoa = new Pool({
  name: 'Datamoa',
  host: postgresConfig_Datamoa.address,
  port: postgresConfig_Datamoa.port,
  database: postgresConfig_Datamoa.database,
  user: postgresConfig_Datamoa.user,
  password: postgresConfig_Datamoa.password,
});

const postgresClient_Toilet = new Pool({
  name: 'Toilet',
  host: postgresConfig_Toilet.address,
  port: postgresConfig_Toilet.port,
  database: postgresConfig_Toilet.database,
  user: postgresConfig_Toilet.user,
  password: postgresConfig_Toilet.password,
});

const postgresClient_Toto = new Pool({
  name: 'Toto',
  host: postgresConfig_Toto.address,
  port: postgresConfig_Toto.port,
  database: postgresConfig_Toto.database,
  user: postgresConfig_Toto.user,
  password: postgresConfig_Toto.password,
});

// Connection test
module.exports.dbConnect = async (pgClient) => {
  await new Promise((resolve, reject) => {
    pgClient.connect(err => {
      if (err) {
        console.log(`[${pgClient.options.name}] Connect to postgres failed.`);
        reject(err);
      } else {
        console.log(`[${pgClient.options.name}] Connect to postgres done.`);
        resolve();
      }
    });
  });
}

// TODO: Pool을 바로 제공하지 않고, Query할 떄 마다 Pool의 Client를 제공하도록 수정 필요.
module.exports.datamoaDB = postgresClient_Datamoa;
module.exports.toiletDB = postgresClient_Toilet;
module.exports.totoDB = postgresClient_Toto;