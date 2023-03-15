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
  const result = await fetchToiletData();

  if (result.totalCount > 0) {
    const response = createResponseObj(result, 'ok', true);

    res.status(200).json(response);
  } else {
    next(result);
  }
}

module.exports.getMapInfo = async (req, res, next) => {
  try {
    const params = req.query;

    if (!params.location_lat || !params.location_lng || !params.sw_lat || !params.sw_lng || !params.ne_lat || !params.ne_lng) {
      const response = createResponseObj({}, '[10021] Invalid query', false);
      res.status(400).json(response);
      return;
    }

    const toilet = new toiletModel.Toilet();
    const {rows} = await toilet.readByLatLng(params);

    const responseResult = rows
      // 현재 위치와 화장실 위치의 직선 거리 추가
      .map(row => {
        row.distance = Math.sqrt(Math.pow(row.wsg84_x - parseFloat(params.location_lng), 2) + Math.pow(row.wsg84_y - parseFloat(params.location_lat), 2));
        return row;
      })
      // 직선 거리 기준으로 오름차순으로 정렬
      .sort((a, b) => {
        return a.distance - b.distance;
      })
      // 응답 객체 반환
      .map(row => {
        return {
          id: row.toilet_id,
          category: row.toilet_category_name,
          nameArray: row.toilet_name,
          region: row.toilet_region,
          address: row.toilet_address,
          roadAddress: row.toilet_road_address,
          management: row.management_agency,
          phoneNumber: row.phone_number,
          openTime: row.open_hour,
          lat: row.wsg84_y,
          lng: row.wsg84_x
        }
      });

    const response = createResponseObj(responseResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }
}


// Fetch from url
const fetchToiletData = async () => {
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
      const jsonSheet = excel.utils.sheet_to_json(sheet)
        // 도로명 및 지번 주소로 정렬
        .sort((a, b) => {
          if (a['소재지도로명주소'] > b['소재지도로명주소']) return 1;
          if (b['소재지도로명주소'] > a['소재지도로명주소']) return -1;
          if (a['소재지지번주소'] > b['소재지지번주소']) return 1;
          if (b['소재지지번주소'] > a['소재지지번주소']) return -1;
          return 0;
        });

      // Create insert object
      const insertObjectArray = [];
      const failedAddressArray = [];
      let currentNameArray = [];
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
          // 같은 주소의 화장실 이름이 중복되지 않을 경우만 이름 추가
          if (!currentNameArray.includes(row['화장실명'])) {
            currentNameArray.push(row['화장실명']);
            insertObjectArray.at(-1).name += `, "${row['화장실명']}"`;
            successCount++;
          }
          continue;
        }

        previousAddress = currentAddress;

        // 카카오맵에 시도 후, 실패하면 네이버맵에 시도
        let result = await geocodeApiRequest_Kakao(currentAddress);
        result = result ? result : await geocodeApiRequest_Naver(currentAddress);

        // 도로명주소가 실패하면 지번주소로 다시 시도
        if (!result && address_2 && currentAddress === address_1) {
          currentAddress = address_2;
          result = await geocodeApiRequest_Kakao(currentAddress);
          result = result ? result : await geocodeApiRequest_Naver(currentAddress);
        }

        // 모두 실패하면 넘어간다.
        if (!result) {
          failedAddressArray.push(currentAddress);
          previousAddress = '';
          continue;
        }

        // 지번이나 도로명 주소 중, 하나라도 Null이면 Reverse Geocode API 요청
        if (!result.address || !result.roadAddress) {
          const addressResult = await reverseGeocodeApiRequest_Naver(result.x, result.y);
          if (addressResult) {
            result.address = addressResult.address;
            result.roadAddress = addressResult.roadAddress;
          }
        }

        currentNameArray = [row['화장실명']] ;

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
          name: `"${row['화장실명']}"`,
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

      logger.info(`[${toiletDownloadConfig.indexOf(pair) + 1}/${toiletDownloadConfig.length}] Toilet data loading...`, {result: infoLogObject});
    }

    // Truncate table
    const truncateResult = await toilet.truncateTable();
    // Copy to table from temp table
    const copyResult = truncateResult ? await toilet.copyTable() : false;
    // Drop temp table
    //const dropResult = copyResult ? await toilet.dropTempTable() : false;

    const totalEndTime = new Date();

    const result = {
      totalCount: totalToiletCount,
      totalDuration: `${totalEndTime - totalStartTime} ms`
    }

    logger.info('Toilet data loaded', {result: result});

    return result;
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));

    return err;
  } finally {
    // Drop temp table
    await toilet.dropTempTable();
  }
}
module.exports.fetchToiletData = fetchToiletData;


// Map api request
const geocodeApiRequest_Naver = async (address) => {
  try {
    const urlParam = new URLSearchParams({
      query: address,
      page: 1,
      count: 1
    });

    const response = await fetch(apiConfig.naverMapGeocodeUrl + '?' + urlParam, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID' : apiConfig.naverMapId,
        'X-NCP-APIGW-API-KEY' : apiConfig.naverMapSecret
      }
    });
    const {addresses} = await response.json();

    if (addresses.length === 0) {
      return false;
    }

    return {
      x: addresses[0].x,
      y: addresses[0].y,
      address: addresses[0].jibunAddress || '',
      roadAddress: addresses[0].roadAddress || ''
    };
  } catch (err) {
    return false;
  }
}

const reverseGeocodeApiRequest_Naver = async (x, y) => {
  try {
    const urlParam = new URLSearchParams({
      coords: `${x},${y}`,
      orders: 'addr,roadaddr',
      output: 'json'
    });

    const response = await fetch(apiConfig.naverMapReverseGeocodeUrl + '?' + urlParam, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID' : apiConfig.naverMapId,
        'X-NCP-APIGW-API-KEY' : apiConfig.naverMapSecret
      }
    });
    const {results} = await response.json();

    const addrRegion = results[0].region;
    const addrLand = results[0].land;

    let addr = addrRegion.area1.name ? addrRegion.area1.name : '';
    addr += addrRegion.area2.name ? ' ' + addrRegion.area2.name : '';
    addr += addrRegion.area3.name ? ' ' + addrRegion.area3.name : '';
    addr += addrRegion.area4.name ? ' ' + addrRegion.area4.name : '';
    addr += addrLand.number1 ? ' ' + addrLand.number1 : '';
    addr += addrLand.number2 ? '-' + addrLand.number2 : '';

    const roadRegion = results[1].region;
    const roadLand = results[1].land;

    let road = roadRegion.area1.name ? roadRegion.area1.name : '';
    road += roadRegion.area2.name ? ' ' + roadRegion.area2.name : '';
    road += roadRegion.area3.name ? ' ' + roadRegion.area3.name : '';
    road += roadRegion.area4.name ? ' ' + roadRegion.area4.name : '';
    road += roadLand.name ? ' ' + roadLand.name : '';
    road += roadLand.number1 ? ' ' + roadLand.number1 : '';
    road += roadLand.number2 ? '-' + roadLand.number2 : '';

    return {
      address: addr,
      roadAddress: road
    };
  } catch (err) {
    return false;
  }
}

const geocodeApiRequest_Kakao = async (addr) => {
  try {
    const urlParam = new URLSearchParams({
      query: addr,
      page: 1,
      size: 1
    });

    const response = await fetch(apiConfig.kakaoMapGeocodeUrl + '?' + urlParam, {
      headers: {'Authorization': `KakaoAK ${apiConfig.kakaoMapKey}`}
    });
    const {documents} = await response.json();

    if (documents.length === 0) {
      return false;
    }

    const address = documents[0].address ? documents[0].address.address_name : '';
    const roadAddress = documents[0].road_address ? documents[0].road_address.address_name : '';

    return {
      x: documents[0].x,
      y: documents[0].y,
      address: address,
      roadAddress: roadAddress
    };
  } catch (err) {
    return false;
  }
}
