const totoService = require('../Services/totoService');
const {HMACAuthorization} = require('../Services/commonService');
const router = require('express').Router();

router.get('/sync', HMACAuthorization, totoService.getSync);
router.get('/map/info', HMACAuthorization, totoService.getMapInfo);

module.exports = router;
