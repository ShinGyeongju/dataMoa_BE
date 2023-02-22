const logger = require('../../Common/logger').toiletLogger;
const toiletModel = require('../Models/toiletModel');
const {createResponseObj, createErrorMetaObj} = require('./commonService');
const {apiKeyConfig} = require('../../Common/config');
const excel = require('xlsx');
const {log} = require("winston");


// Service
module.exports.getToilet = (req, res, next) => {
  res.sendfile();
}

module.exports.getSync = async (req, res, next) => {
  const toiletDataUrl = {
    LOCALDATA_SEOUL: 'https://www.localdata.go.kr/lif/etcDataDownload.do?localCodeEx=6110000&sidoCodeEx=6110000&sigunguCodeEx=&opnSvcIdEx=12_04_01_E&startDateEx=&endDateEx=&fileType=xlsx&opnSvcNmEx=%25EA%25B3%25B5%25EC%25A4%2591%25ED%2599%2594%25EC%259E%25A5%25EC%258B%25A4%25EC%25A0%2595%25EB%25B3%25B4'
  };

  try {
    console.log(new Date().toTimeString());

    // Excel download from url
    const response = await fetch(toiletDataUrl.LOCALDATA_SEOUL);
    const data = await response.arrayBuffer();

    // Excel read from buffer
    const workbook = excel.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonSheet = excel.utils.sheet_to_json(sheet);

    console.log(new Date().toTimeString());

    // TODO: 카카오맵 API를 활용해 도로명 주소를 X/Y 좌표로 변환하기

    // Create insert values
    // const insertObj = await Promise.all(
    //   jsonSheet.map(async (row) => {
    //     const categoryStr = row['구분'];
    //     let category = 4;
    //     if (categoryStr.includes('공중')) {
    //       category = 1;
    //     } else if (categoryStr.includes('개방')) {
    //       category = 2;
    //     } else if (categoryStr.includes('간이')) {
    //       category = 3;
    //     }
    //
    //     const urlParam = new URLSearchParams({query: row['소재지도로명주소']});
    //     const response = await fetch('https://dapi.kakao.com/v2/local/search/address.json?' + urlParam, {
    //       headers: {'Authorization': `KakaoAK ${apiKeyConfig.kakaoMap}`}
    //     });
    //     const {documents} = await response.json();
    //     const {x, y} = documents[0].address;
    //
    //     return {
    //       category: category,
    //       name: row['화장실명'] || '',
    //       management: row['관리기관명'] || null,
    //       phoneNum: row['전화번호'] || null,
    //       openHour: row['개방시간'] || null,
    //       x: xx,
    //       y: yy
    //     };
    //   })
    // );
let a = 0;
    const insertObj = [];
    for (const row of jsonSheet) {
      const categoryStr = row['구분'];
      let category = 4;
      if (categoryStr.includes('공중')) {
        category = 1;
      } else if (categoryStr.includes('개방')) {
        category = 2;
      } else if (categoryStr.includes('간이')) {
        category = 3;
      }

      let xx, yy;
      let res;
      try {
        const urlParam = new URLSearchParams({
          query: row['소재지도로명주소'],
          page: 1,
          size: 1
        });
        // TODO: 특정 도로명주소로 API요청 시 에러가 반환되는 문제 발생.
        const response = await fetch('https://dapi.kakao.com/v2/local/search/address.json?' + urlParam, {
          headers: {'Authorization': `KakaoAK ${apiKeyConfig.kakaoMap}`}
        });
        res = response;
        const {documents} = await response.json();
        const {x, y} = documents[0].address;
        xx = x;
        yy = y;
      } catch(err) {
        console.error(a + '    ' + row['화장실명']);
        console.error(res);
      }

      insertObj.push({
        category: category,
        name: row['화장실명'] || '',
        management: row['관리기관명'] || null,
        phoneNum: row['전화번호'] || null,
        openHour: row['개방시간'] || null,
        x: xx,
        y: yy
      });
      a++;
      console.log(a + '    ' + row['화장실명']);
      // await new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     resolve();
      //   }, 100);
      // });
    }

    console.log(insertObj);
    console.log(new Date().toTimeString());

    // Insert to db
    const toilet = new toiletModel.Toilet();
    const result = await toilet.create(insertObj);

    console.log(new Date().toTimeString());

    console.log(result);


  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }

  res.json({test: true});
}
