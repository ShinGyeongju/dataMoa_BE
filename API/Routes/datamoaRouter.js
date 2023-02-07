const datamoaService = require('../Services/datamoaService');
const router = require('express').Router();

router.get('/', datamoaService.getDatamoa);
router.get('/category', datamoaService.getCategory);
router.get('/subpage/:categoryId', datamoaService.getSubpage);
router.post('/voc', datamoaService.postVoc);

module.exports = router;
