const datamoaService = require('../Services/datamoaService');
const {HMACAuthorization} = require('../Services/commonService');
const router = require('express').Router();

router.get('/category', HMACAuthorization, datamoaService.getCategory);
router.get('/subpage', HMACAuthorization, datamoaService.getSubpage);
router.get('/subpage/:pageId', HMACAuthorization, datamoaService.getSubpage);
router.post('/voc', HMACAuthorization, datamoaService.postVoc);
router.get('/voc/category', HMACAuthorization, datamoaService.getVocCategory);

module.exports = router;
