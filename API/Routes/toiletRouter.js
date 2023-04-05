const toiletService = require('../Services/toiletService');
const {HMACAuthorization} = require('../Services/commonService');
const router = require('express').Router();

router.get('/sync', HMACAuthorization, toiletService.getSync);
router.get('/map/info', HMACAuthorization, toiletService.getMapInfo);

module.exports = router;
