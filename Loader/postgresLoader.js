const {Pool} = require('pg');
const {postgresConfig_Datamoa} = require('../Common/config');


// Postgres pool
const postgresClient_Datamoa = new Pool({
  host: postgresConfig_Datamoa.address,
  post: postgresConfig_Datamoa.port,
  database: postgresConfig_Datamoa.database,
  user: postgresConfig_Datamoa.user,
  password: postgresConfig_Datamoa.password,
});

// Connection test
module.exports.dbConnect = async () => {
  await new Promise((resolve, reject) => {
    postgresClient_Datamoa.connect(err => {
      if (err) {
        reject(err);
      } else {
        //console.log('Connect to postgres[Datamoa] done.');
        resolve();
      }
    });
  });
}


// TODO: Pool을 바로 제공하지 않고, Query할 떄 마다 Pool의 Client를 제공하도록 수정 필요.
module.exports.datamoaDB = postgresClient_Datamoa;