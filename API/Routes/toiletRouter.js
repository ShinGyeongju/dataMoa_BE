const toiletService = require('../Services/toiletService');
const router = require('express').Router();

router.get('/', toiletService.getToilet);
router.get('/sync', toiletService.getSync);
router.get('/map/info', toiletService.getMapInfo)

module.exports = router;
