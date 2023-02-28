const logger = require('../../Common/logger').toiletLogger;
const toiletModel = require('../Models/toiletModel');
const {createResponseObj, createErrorMetaObj} = require('./commonService');
const {apiConfig, toiletDownloadConfig} = require('../../Common/config');
const excel = require('xlsx');


// Service
module.exports.getToilet = (req, res, next) => {
  res.sendfile();
}

module.exports.getSync = async (req, res, next) => {
  const toilet = new toiletModel.Toilet();

  let totalToiletCount = 0;
  const totalStartTime = new Date();

  try {
    // Create temp table
    const tempResult = await toilet.createTempTable();

    for (const pair of toiletDownloadConfig) {
      const startTime = new Date();

      // Excel download from url
      const response = await fetch(pair.url);
      const data = await response.arrayBuffer();

      // Excel read from buffer
      const workbook = excel.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonSheet = excel.utils.sheet_to_json(sheet);

      // Create insert object
      const insertObjectArray = [];
      const failedAddressArray = [];
      let previousAddress = '';
      let failCount = 0;
      let successCount = 0;

      // TODO: 지도 API 요청을 병렬로 처리시, API 서버의 할당량 초과 문제 발생.
      for (const row of jsonSheet) {
        let address_1 = row['소재지도로명주소'];
        let address_2 = row['소재지지번주소'];
        let currentAddress = address_1 || address_2;

        // 직전에 실패한 주소와 현재의 주소가 같으면 넘어간다.
        if (failedAddressArray.at(-1) === address_1 || failedAddressArray.at(-1) === address_2) {
          failCount++;
          continue;
        }
        // 직전에 성공한 주소와 현재의 주소가 같으면 이름만 추가
        if (previousAddress === currentAddress) {
          insertObjectArray.at(-1).name += `, ${row['화장실명']}`;
          successCount++;
          continue;
        }
        previousAddress = currentAddress;

        // 카카오맵에 시도 후, 실패하면 네이버맵에 시도
        let result = await mapApiRequest_Kakao(currentAddress);
        result = result ? result : await mapApiRequest_Naver(currentAddress);

        // 도로명주소가 실패하면 지번주소로 다시 시도
        if (!result && address_2 && currentAddress === address_1) {
          currentAddress = address_2;
          result = await mapApiRequest_Kakao(currentAddress);
          result = result ? result : await mapApiRequest_Naver(currentAddress);
        }

        if (!result) {
          failedAddressArray.push(currentAddress);
          previousAddress = '';
          continue;
        }

        const categoryStr = row['구분'];
        let category = 4;
        if (categoryStr.includes('공중')) {
          category = 1;
        } else if (categoryStr.includes('개방')) {
          category = 2;
        } else if (categoryStr.includes('간이')) {
          category = 3;
        }

        insertObjectArray.push({
          category: category,
          name: row['화장실명'],
          region: pair.region,
          address: result.address || null,
          road_address: result.roadAddress || null,
          management: row['관리기관명'] || null,
          phoneNum: row['전화번호'] || null,
          openHour: row['개방시간'] || null,
          x: result.x,
          y: result.y
        });
      }

      // Insert to tempDB
      const insertResult = await toilet.insertToTemp(insertObjectArray);
      console.log(insertResult);
      totalToiletCount += insertObjectArray.length + successCount;

      const endTime = new Date();

      const infoLogObject = {
        region: pair.region,
        targetCount: jsonSheet.length,
        succeedCount: insertObjectArray.length + successCount,
        failedCount: failedAddressArray.length + failCount,
        failedAddressArray: failedAddressArray,
        duration: `${endTime - startTime} ms`
      }

      logger.info('Toilet data loading...', {result: infoLogObject});
    }

    // Truncate table
    const truncateResult = await toilet.truncateTable();
    // Copy to table from temp table
    const copyResult = truncateResult ? await toilet.copyTable() : false;
    // Drop temp table
    const dropResult = copyResult ? await toilet.dropTempTable() : false;

    const totalEndTime = new Date();

    const result = {
      totalCount: totalToiletCount,
      totalDuration: `${totalEndTime - totalStartTime} ms`
    }

    logger.info('Toilet data loaded', {result: result});

    const response = createResponseObj(result, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    await toilet.dropTempTable();
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }
}

// Map api request
const mapApiRequest_Naver = async (address) => {
  try {
    const urlParam = new URLSearchParams({
      query: address,
      page: 1,
      count: 1
    });

    const response = await fetch(apiConfig.naverMapUrl + '?' + urlParam, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID' : apiConfig.naverMapId,
        'X-NCP-APIGW-API-KEY' : apiConfig.naverMapSecret
      }
    });
    const {addresses} = await response.json();
    const {x, y, roadAddress, jibunAddress} = addresses[0];

    return {
      x: x,
      y: y,
      address: jibunAddress,
      roadAddress: roadAddress
    };
  } catch (err) {
    return false;
  }
}

const mapApiRequest_Kakao = async (address) => {
  try {
    const urlParam = new URLSearchParams({
      query: address,
      page: 1,
      size: 1
    });

    const response = await fetch(apiConfig.kakaoMapUrl + '?' + urlParam, {
      headers: {'Authorization': `KakaoAK ${apiConfig.kakaoMap}`}
    });
    const {documents} = await response.json();
    const {x, y, address, road_address} = documents[0];

    return {
      x: x,
      y: y,
      address: address.address_name,
      roadAddress: road_address.address_name
    };
  } catch (err) {
    return false;
  }
}
