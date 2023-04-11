const {PostgresModel} = require('./commonModel');
const {totoDB} = require('../../Loader/postgresLoader');

// Model
module.exports.Toto = class Toto extends PostgresModel{
  constructor() {
    super();
  }

  createTempTable() {
    return totoDB.query('CREATE TABLE tb_toto_temp (LIKE tb_toto);');
  }

  insertToTemp(insertObject) {
    let querySql = 'INSERT INTO tb_toto_temp (toto_id, toto_category, toto_name, toto_region, toto_address, toto_road_address, address_detail, phone_number, wsg84_x, wsg84_y, created_at) VALUES ';

    insertObject.forEach(row => {
      const address = this.nullValidator(row.address);
      const roadAddress = this.nullValidator(row.road_address);
      const addressDetail = this.nullValidator(this.stringValidator(row.addressDetail));
      const phoneNum = this.nullValidator(row.phoneNum);

      querySql += `(uuid_generate_v4(), '{${row.category}}', '${row.name}', '${row.region}', ${address}, ${roadAddress}, ${addressDetail}, ${phoneNum}, ${row.x}, ${row.y}, now()),`;
    });

    return totoDB.query(querySql.slice(0, -1));
  }

  truncateTable() {
    return totoDB.query('TRUNCATE TABLE tb_toto;');
  }

  copyTable() {
    return totoDB.query('INSERT INTO tb_toto SELECT * FROM tb_toto_temp;');
  }

  dropTempTable() {
    return totoDB.query('DROP TABLE IF EXISTS tb_toto_temp;');
  }

}