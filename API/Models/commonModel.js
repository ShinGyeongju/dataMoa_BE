
module.exports.PostgresModel = class PostgresModel {
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

}