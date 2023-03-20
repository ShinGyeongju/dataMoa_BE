const datamoaService = require('../Services/datamoaService');
const router = require('express').Router();

router.get('/category', datamoaService.getCategory);
router.get('/subpage', datamoaService.getSubpage);
router.get('/subpage/:pageId', datamoaService.getSubpage);
router.post('/voc', datamoaService.postVoc);
router.get('/voc/category', datamoaService.getVocCategory);

module.exports = router;
