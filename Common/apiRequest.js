const {apiConfig} = require("./config");


// Map api request
module.exports.geocodeApiRequest_Naver = async (address) => {
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

module.exports.reverseGeocodeApiRequest_Naver = async (x, y) => {
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

module.exports.geocodeApiRequest_Kakao = async (addr) => {
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