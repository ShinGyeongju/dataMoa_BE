const logger = require('../../Common/logger').totoLogger;
const totoModel = require('../Models/totoModel');
const {createResponseObj, createErrorMetaObj} = require('./commonService');
const {totoApiConfig} = require('../../Common/config');
const {geocodeApiRequest_Kakao, geocodeApiRequest_Naver} = require('../../Common/apiRequest');
const puppeteer = require('puppeteer');
const iconv = require('iconv-lite');


// Service
module.exports.getSync = async (req, res, next) => {
  const result = await fetchTotoData();

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

    // 파라미터가 누락되면 Code 400 반환
    if (!params.location_lat || !params.location_lng || !params.sw_lat || !params.sw_lng || !params.ne_lat || !params.ne_lng || !params.typeArray) {
      const response = createResponseObj({}, '[10031] Invalid query params', false);
      res.status(400).json(response);
      return;
    }

    params.typeArray = params.typeArray.split(',');
    const typeArray = ['toto', 'lotto', 'pension', 'speedo'];

    // type 파라미터가 지정된 값이 아니면 Code 400 반환
    params.typeArray.some(type => {
      if (!typeArray.includes(type)) {
        const response = createResponseObj({}, '[10032] Invalid type', false);
        res.status(400).json(response);
        return true;
      }
    });

    const toto = new totoModel.Toto();
    const {rows} = await toto.readByLatLng(params);

    const responseResult = rows
      // 현재 위치와 화장실 위치의 직선 거리 추가
      .map(row => {
        row.distance = Math.sqrt(Math.pow(row.wsg84_x - parseFloat(params.location_lng), 2) + Math.pow(row.wsg84_y - parseFloat(params.location_lat), 2));
        return row;
      })
      // 직선 거리 기준 오름차순으로 정렬
      .sort((a, b) => {
        return a.distance - b.distance;
      })
      // 응답 객체 반환
      .map(row => {
        return {
          id: row.toto_id,
          typeArray: row.toto_category,
          name: row.toto_name,
          region: row.toto_region,
          address: row.toto_address,
          roadAddress: row.toto_road_address + ', ' + row.address_detail,
          phoneNumber: row.phone_number,
          lat: row.wsg84_y,
          lng: row.wsg84_x
        }
      });

    const response = createResponseObj(responseResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }}


const htmlDecoder = (str) => {
  if (!str) return str;

  return str
    .replaceAll('&&#35;40;', '(')
    .replaceAll('&&#35;41;', ')')
    .replaceAll('&amp;', '&')
    .replaceAll('&#35;', '#')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&apos;', ' ');
}

// Fetch from url
const fetchTotoData = async () => {
  const startTime = new Date();
  let totoObjectArray = [];

  // Request to dhlottery
  // START
  try {
    const regionArray = await createRegionArray();

    for (const regionObj of regionArray) {
      for (const depth of regionObj.depthArray) {
        const {totalPage} = await dhlotteryApiRequest(regionObj.region, depth, 1);

        for (let i = 1; i <= totalPage; i++) {
          const {arr} = await dhlotteryApiRequest(regionObj.region, depth, i);

          for (const toto of arr) {
            // 중간 주소가 null이면 넘어간다.
            if (!toto.BPLCLOCPLC3) continue;

            const categoryArray = [];
            toto.LOTT_YN === 'Y' && categoryArray.push('"lotto"');
            toto.ANNUITY_YN === 'Y' && categoryArray.push('"pension"');
            (toto.SPEETTO500_YN === 'Y' || toto.SPEETTO1000_YN === 'Y' || toto.SPEETTO2000_YN === 'Y') && categoryArray.push('"speedo"');

            // 취급 권종이 없으면 넘어간다.
            if (categoryArray.length === 0) continue;

            toto.BPLCLOCPLC3 = htmlDecoder(toto.BPLCLOCPLC3);
            toto.BPLCLOCPLC4 = htmlDecoder(toto.BPLCLOCPLC4);

            const splitStr = toto.BPLCLOCPLC4.split(' ');
            const bplclocplc4 = splitStr[0];

            // 상세 주소
            const addressDetail = splitStr.length > 1 ? toto.BPLCLOCPLC4.replace(bplclocplc4 + ' ', '').trim() : null;
            // 상세 주소를 제외한 전체 주소
            const address = `${toto.BPLCLOCPLC1} ${toto.BPLCLOCPLC2} ${toto.BPLCLOCPLC3} ${bplclocplc4}`

            // 네이버맵에 시도 후, 실패하면 카카오맵에 시도
            let result = await geocodeApiRequest_Naver(address);
            result = result || await geocodeApiRequest_Kakao(address);
            result = result || {};

            const lastChar = toto.BPLCLOCPLC3.slice(-1);
            if (lastChar === '로' || lastChar === '길') {
              result.roadAddress = address;
            } else {
              result.address = address;
            }

            totoObjectArray.push({
              category: categoryArray.join(', '),
              name: htmlDecoder(toto.SHOP_NM),
              region: regionObj.region,
              address: result.address || null,
              road_address: result.roadAddress || null,
              addressDetail: addressDetail,
              phoneNum: toto.TELEPHONE || null,
              x: toto.ADDR_LOT,
              y: toto.ADDR_LAT
            });
          }
        }
      }
    }
  } catch (err) {
    return err;
  }
  // END

  // Request to sportstoto
  // START
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const protoObjectArray = [];

  try {
    await page.goto(totoApiConfig.sportstotoCrawlUrl, {waitUnitl: 'domcontentloaded'});

    // 전체 페이지 수 구하기
    const lastPageSelector = await page.$('body > div.wrapper > div.container.content > div:nth-child(5) > div > a:nth-child(9)');
    const lastPageHref = await lastPageSelector.evaluate(el => el.getAttribute('href'));
    const lastPage = lastPageHref.split('=')[1];

    for (let i = 1; i <= lastPage; i++) {
      await page.goto(totoApiConfig.sportstotoCrawlUrl + '?page=' + i, {waitUnitl: 'domcontentloaded'});

      const totoSelectorArray = await page.$$('body > div.wrapper > div.container.content > div:nth-child(4) > div > table > tbody > tr');

      const totoPromiseArray = totoSelectorArray.map(async totoSelector => {
        const addressSelector = await totoSelector.$('td.loc3');
        const splitAddr = (await addressSelector.evaluate(el => el.textContent)).split(',');
        let address = splitAddr[0];
        address = htmlDecoder(address);
        let addressDetail = splitAddr.length > 1 ? splitAddr[1].trim() : null;
        addressDetail = htmlDecoder(addressDetail);

        const index = totoObjectArray.findIndex(value => {
          if (value.address === address || value.road_address === address) return true;
        });

        // 복권방 데이터와 주소가 겹치면 Category만 추가.
        if (0 <= index) {
          const category = totoObjectArray.at(index).category;
          // toto 카테고리가 이미 있으면 추가 안함.
          if (!category.includes('"toto"')) {
            totoObjectArray.at(index).category = '"toto", ' + category;
          }
        } else {
          const regionSelector = await totoSelector.$('td.loc1');
          const region = await regionSelector.evaluate(el => el.textContent);

          const nameSelector = await totoSelector.$('td.loc2');
          const name = await nameSelector.evaluate(el => el.textContent);

          const lng = await totoSelector.evaluate(el => el.getAttribute('x-axis'));
          const lat = await totoSelector.evaluate(el => el.getAttribute('y-axis'));

          // 네이버맵에 시도 후, 실패하면 카카오맵에 시도
          let result = await geocodeApiRequest_Naver(address);
          result = result || await geocodeApiRequest_Kakao(address);
          result = result || {};

          const addressSplit = address.split(' ');
          const lastChar = addressSplit[2].slice(-1) + addressSplit[3].slice(-1);
          if (lastChar.includes('로') || lastChar.includes('길')) {
            result.roadAddress = address;
          } else {
            result.address = address;
          }

          protoObjectArray.push({
            category: '"toto"',
            name: htmlDecoder(name),
            region: region,
            address: result.address || null,
            road_address: result.roadAddress || null,
            addressDetail: addressDetail,
            phoneNum: null,
            x: parseFloat(lng),
            y: parseFloat(lat)
          });
        }
      });
      await Promise.all(totoPromiseArray);
    }

    totoObjectArray = totoObjectArray.concat(protoObjectArray);
  } catch (err) {
    return err;
  } finally {
    await browser.close();
  }
  // END


  // DB Insert
  // START
  const toto = new totoModel.Toto();

  try {
    // Create temp table
    const createResult = await toto.createTempTable();
    // Insert to tempDB
    const insertResult = createResult && await toto.insertToTemp(totoObjectArray);
    // Truncate table
    const truncateResult = insertResult && await toto.truncateTable();
    // Copy to table from temp table
    const copyResult = truncateResult && await toto.copyTable();

  } catch (err) {
    return err;
  } finally {
    // Drop temp table
    await toto.dropTempTable();
  }
  // END


  const endTime = new Date();
  const result = {
    totalCount: totoObjectArray.length,
    totalDuration: `${endTime - startTime} ms`
  }

  logger.info('Toto data loaded', {result: result});

  return result;
}

// Crawl from lottery pages
const createRegionArray = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(totoApiConfig.dhlotteryCrawlUrl, {waitUnitl: 'load'});

    const regionArray = [];
    const regionCount = (await page.$$('#mainMenuArea > a')).length + 1;
    for (let i = 1; i <= regionCount; i++) {
      let region = '';

      // 처음에만 span태그로 검색
      if (i === 1) {
        const regionSelector = await page.$('#mainMenuArea > span');
        region = await regionSelector.evaluate(el => el.textContent);
        // 다음부터 a태그로 검색
      } else {
        const regionSelector = await page.$(`#mainMenuArea > a:nth-child(${i})`);
        region = await regionSelector.evaluate(el => el.textContent);

        await regionSelector.click();

        // click 후, element 생성 까지 1초 대기
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }

      const depthArray = [];
      const depthSelectorArray = await page.$$('#subMenu > a');
      const promiseArray = depthSelectorArray.map(async depthSelector => {
        const depth = await depthSelector.evaluate(el => el.textContent);
        depthArray.push(depth);
      });
      await Promise.all(promiseArray);

      regionArray.push({
        region: region,
        depthArray: depthArray
      });
    }

    return regionArray;
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
}

const dhlotteryApiRequest = async (region, depth, nowPage) => {
  const response = await fetch(totoApiConfig.dhlotteryApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: new URLSearchParams({
      searchType: 3,
      nowPage: nowPage,
      sltSIDO2: region,
      sltGUGUN2: depth,
      corpYn: 'Y'
    })
  });
  const arrayBuffer = await response.arrayBuffer();
  const decodedString = iconv.decode(Buffer.from(arrayBuffer), 'euc-kr');

  return JSON.parse(decodedString);
}