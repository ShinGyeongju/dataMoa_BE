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

    const sampleResult = [
      {
        id: '554117a5-c8e8-4c7f-aa2a-887bd423a003',
        type: ['toto', 'lotto', 'pension', 'speedo'],
        name: '행복편의점',
        region: '서울',
        address: '서울특별시 구로구 고척동 167-32',
        roadAddress: '서울특별시 구로구 고척로 199',
        phoneNumber: null,
        openTime: '09:00~20:00',
        lat: 37.5002,
        lng: 126.8673
      },
      {
        id: 'a54c41a1-78cb-4547-85fe-65dc87404f47',
        type: ['toto', 'lotto'],
        name: '스포츠토토',
        region: '서울',
        address: '서울특별시 구로구 고척동 253-130',
        roadAddress: '서울특별시 구로구 고척로32길 11-4',
        phoneNumber: '1688-7277',
        openTime: '09:00~20:00',
        lat: 37.5007,
        lng: 126.8665
      },
      {
        id: '9f389e20-caa8-4b6e-8083-4cdca3b0f92d',
        type: ['lotto', 'pension', 'speedo'],
        name: '로또샹스카페',
        region: '서울',
        address: '서울특별시 구로구 고척동 279-1',
        roadAddress: '서울특별시 구로구 안양천서자전거길 714',
        phoneNumber: null,
        openTime: null,
        lat: 37.5017,
        lng: 126.8676
      },
      {
        id: '9186b944-b10a-4e9f-ac9c-3bd879c8f684',
        type: ['toto', 'lotto', 'pension', 'speedo'],
        name: '유성포장',
        region: '서울',
        address: '서울특별시 구로구 고척동 339-4',
        roadAddress: '서울특별시 구로구 중앙로15길 72',
        phoneNumber: '1577-1597',
        openTime: null,
        lat: 37.5011,
        lng: 126.866
      },
      {
        id: 'd6043c56-4f98-487a-bcee-e40a9fd90688',
        type: ['toto', 'lotto', 'pension', 'speedo'],
        name: '주택복권사랑방',
        region: '서울',
        address: '서울특별시 구로구 고척동 63-6 고척스카이돔',
        roadAddress: '서울특별시 구로구 경인로 430 고척스카이돔',
        phoneNumber: null,
        openTime: null,
        lat: 37.5016,
        lng: 126.8665
      },
      {
        id: '72d2d4de-f37e-418d-9323-62d97f650f56',
        type: ['toto'],
        name: '프로또마트',
        region: '서울',
        address: '서울특별시 구로구 고척동 69-34 송림가든',
        roadAddress: null,
        phoneNumber: null,
        openTime: '09:00~20:00',
        lat: 37.5001,
        lng: 126.8656
      },
      {
        id: 'ccac7f27-0118-4070-9fbf-e6a1e986de7d',
        type: ['toto', 'lotto'],
        name: '현진슈퍼',
        region: '서울',
        address: '서울특별시 구로구 고척동 82-9 고척제1동주민센터',
        roadAddress: '서울특별시 구로구 중앙로3길 18-8 고척제1동주민센터',
        phoneNumber: '02-618-1697',
        openTime: null,
        lat: 37.4991,
        lng: 126.8675
      },
      {
        id: '3569894a-07d6-4398-b543-bac80769cf7f',
        type: ['lotto', 'pension', 'speedo'],
        name: 'SE구로점',
        region: '서울',
        address: '서울특별시 구로구 고척동 산9-14',
        roadAddress: '서울특별시 구로구 고척로45길 37',
        phoneNumber: '1688-1918',
        openTime: '09:00~20:00',
        lat: 37.4999,
        lng: 126.8698
      },
      {
        id: '7f0cbf02-d54f-4bd1-a604-bbee3a287809',
        type: ['toto', 'lotto', 'pension', 'speedo'],
        name: 'GS25구로화원점',
        region: '서울',
        address: '서울특별시 구로구 고척동 산9-14 구로구민체육센터',
        roadAddress: null,
        phoneNumber: null,
        openTime: null,
        lat: 37.502,
        lng: 126.8645
      },
      {
        id: '40e1725d-6ac1-41b2-ac1c-3f8b31998759',
        type: ['toto', 'lotto'],
        name: '한솔유통',
        region: '서울',
        address: '서울특별시 구로구 구로동 100-10 구로그린주유소',
        roadAddress: '서울특별시 구로구 구로중앙로 76 구로그린주유소',
        phoneNumber: '1528-0287',
        openTime: null,
        lat: 37.5005,
        lng: 126.8634
      }
    ];

    const response = createResponseObj(sampleResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }}


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
            (toto.SPEETTO500_YN === 'Y' || toto.SPEETTO1000_YN === 'Y' || toto.SPEETTO2000_YN === 'Y') && categoryArray.push('"pension"');

            const splitStr = toto.BPLCLOCPLC4.split(' ');
            const bplclocplc4 = splitStr[0];

            // 상세 주소
            const addressDetail = splitStr.length > 1 ? toto.BPLCLOCPLC4.replace(bplclocplc4 + ' ', '') : null;
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
              name: toto.SHOP_NM,
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
        const address = splitAddr[0];
        const addressDetail = splitAddr.length > 1 ? splitAddr[1].trim() : null;

        const index = totoObjectArray.findIndex(value => {
          if (value.address === address || value.road_address === address) return true;
        });

        // 복권방 데이터와 주소가 겹치면 Category만 추가.
        if (index <= 0) {
          totoObjectArray.at(index).category = '"toto", ' + totoObjectArray.at(index).category;
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
            name: name,
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
    console.log(1);
    // Create temp table
    const createResult = await toto.createTempTable();
    console.log(2);
    // Insert to tempDB
    const insertResult = createResult && await toto.insertToTemp(totoObjectArray);
    console.log(3);
    // Truncate table
    const truncateResult = insertResult && await toto.truncateTable();
    console.log(4);
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