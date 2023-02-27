const {toiletDB} = require('../../Loader/postgresLoader');

// Model
module.exports.Toilet = class Toilet {
  constructor() {
  }

  stringValidator = (str) => {
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

  openHourValidator = (openHour) => {
    if ('24시간' === openHour) {
      return '00:00~23:59';
    } else if ('상시' === openHour) {
      return '00:00~23:59';
    }
    // ex) '08:00~22:00' / '8:00~22:00' / '08:00 ~ 22:00'
    else if (/^([01][0-9]|2[0-3]|[0-9]):([0-5][0-9])( |)~(| )([01][0-9]|2[0-3]):([0-5][0-9])$/.test(openHour)) {
      return openHour.split(':')[0].length === 1 ? '0' + openHour : openHour.replaceAll(' ', '');
    } else {
      return null;
    }
  }

  async create(insertObj) {
    let querySql = 'INSERT INTO tb_toilet (toilet_category_id, toilet_name, toilet_region, toilet_address, toilet_road_address, management_agency, phone_number, open_hour, wsg84_x, wsg84_y) VALUES ';



    insertObj.forEach(row => {
      querySql += `(${row.category}, '{${this.stringValidator(row.name)}}', '${row.region}', '${row.address}', '${row.road_address}', '${this.stringValidator(row.management)}', '${row.phoneNum}', '${this.openHourValidator(row.openHour)}', ${row.x}, ${row.y}),`;
    });

    return toiletDB.query(querySql.slice(0, -1));
  }
}