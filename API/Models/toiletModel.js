const {toiletDB} = require('../../Loader/postgresLoader');

// Model
module.exports.Toilet = class Toilet {
  constructor() {
  }

  async create(insertObj) {
    let querySql = 'INSERT INTO tb_toilet (toilet_category_id, toilet_name, management_agency, phone_number, open_hour, wsg84_x, wsg84_y) VALUES ';

    const stringValidator = (str) => {
      if (str.includes("'")) {
        const splitStr = str.split("'");
        let resultStr = '';
        splitStr.forEach(item => {
          resultStr += item + "''";
        });
        return resultStr.slice(0, -2);
      } else {
        return str;
      }
    }

    insertObj.forEach(row => {
      querySql += `(${row.category}, '${stringValidator(row.name)}', '${stringValidator(row.management)}', '${row.phoneNum}', '${row.openHour}', ${row.x}, ${row.y}),`;
    });

    return toiletDB.query(querySql.slice(0, -1));
  }
}