const {toiletDB} = require('../../Loader/postgresLoader');
const {toiletDownloadConfig} = require('../../Common/config');

// Model
module.exports.Toilet = class Toilet {
  constructor() {
  }

  nullValidator = (str) => {
    if (!str) {
      return null;
    }

    return "'" + str + "'";
  }

  stringValidator = (str) => {
    if (str.includes("'")) {
      const splitStr = str.split("'");
      let resultStr = '';
      splitStr.forEach(item => {
        resultStr += item + "''";
      });
      return resultStr.slice(0, -2);
    }
    if (str.includes('`')) return str.replaceAll('`', '');
    if (str.includes('@')) return str.replaceAll('@', '');
    if (str.includes('?')) return str.replaceAll('?', '');

    return str;
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

  phoneNumberValidator = (phoneNumber, region) => {
    if (!phoneNumber) {
      return null;
    } else if (phoneNumber.length === 8 && !phoneNumber.includes('-')) {
      return phoneNumber.substring(0, 4) + '-' + phoneNumber.substring(4, 8);
    } else if (phoneNumber.length === 7 && !phoneNumber.includes('-')) {
      const regionNumber = toiletDownloadConfig.filter(item => item.region === region)[0].number;
      return regionNumber + '-' + phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7);
    }
  }

  createTempTable() {
    return toiletDB.query('CREATE TABLE tb_toilet_temp (LIKE tb_toilet);');
  }

  dropTempTable() {
    return toiletDB.query('DROP TABLE IF EXISTS tb_toilet_temp;');
  }

  insertToTemp(insertObj) {
    let querySql = 'INSERT INTO tb_toilet_temp (toilet_id, toilet_category_id, toilet_name, toilet_region, toilet_address, toilet_road_address, management_agency, phone_number, open_hour, wsg84_x, wsg84_y, created_at) VALUES ';

    insertObj.forEach(row => {
      const address = this.nullValidator(row.address);
      const roadAddress = this.nullValidator(row.road_address);
      const management = this.nullValidator(this.stringValidator(row.management));
      const phoneNumber = this.nullValidator(this.phoneNumberValidator(row.phoneNum, row.region));
      const openHour = this.nullValidator(this.openHourValidator(row.openHour));

      querySql += `(uuid_generate_v4(), ${row.category}, '{${this.stringValidator(row.name)}}', '${row.region}', ${address}, ${roadAddress}, ${management}, ${phoneNumber}, ${openHour}, ${row.x}, ${row.y}, now()),`;
    });

    return toiletDB.query(querySql.slice(0, -1));
  }

  enableTrigger() {
    return toiletDB.query('ALTER TABLE tb_toilet ENABLE TRIGGER trig_update_time;');
  }

  disableTrigger() {
    return toiletDB.query('ALTER TABLE tb_toilet DISABLE TRIGGER trig_update_time;');
  }

  truncateTable() {
    return toiletDB.query('TRUNCATE TABLE tb_toilet;');
  }

  copyTable() {
    return toiletDB.query('INSERT INTO tb_toilet SELECT * FROM tb_toilet_temp;');
  }

  readByLatLng(params) {
    //return toiletDB.query('SELECT * FROM tb_toilet LEFT OUTER JOIN tb_toilet_category ON tb_toilet.toilet_category_id = tb_toilet_category.toilet_category_id ORDER BY RANDOM() LIMIT 10;');

    return toiletDB.query(`SELECT *
       FROM tb_toilet AS toilet LEFT OUTER JOIN tb_toilet_category AS category ON toilet.toilet_category_id = category.toilet_category_id
       WHERE toilet.wsg84_y BETWEEN ${params.sw_lat} AND ${params.ne_lat} AND toilet.wsg84_x BETWEEN ${params.sw_lng} AND ${params.ne_lng};`);
  }

  updateToManual() {
    return toiletDB.query('UPDATE tb_toilet_manual AS manual SET toilet_id = toilet.toilet_id FROM tb_toilet AS toilet WHERE manual.toilet_address = toilet.toilet_address AND manual.toilet_road_address = toilet.toilet_road_address;');
  }

}