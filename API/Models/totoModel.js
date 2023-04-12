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

      querySql += `(uuid_generate_v4(), '{${row.category}}', '${this.stringValidator(row.name)}', '${row.region}', ${address}, ${roadAddress}, ${addressDetail}, ${phoneNum}, ${row.x}, ${row.y}, now()),`;
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

  readByLatLng(params) {
    let queryString = '';

    if (params.typeArray.length === 4) {
      queryString = `SELECT *
       FROM tb_toto AS toto
       WHERE toto.wsg84_y BETWEEN ${params.sw_lat} AND ${params.ne_lat} AND toto.wsg84_x BETWEEN ${params.sw_lng} AND ${params.ne_lng};`;
    } else {
      const type = params.typeArray.map(type => {
        return '"' + type + '"';
      });

      queryString = `SELECT *
       FROM tb_toto AS toto
       WHERE toto.toto_category && '{${type.join(',')}}'
       AND toto.wsg84_y BETWEEN ${params.sw_lat} AND ${params.ne_lat} AND toto.wsg84_x BETWEEN ${params.sw_lng} AND ${params.ne_lng};`;
    }

    return totoDB.query(queryString);
  }

}