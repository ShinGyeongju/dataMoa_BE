const logger = require('../../Common/logger').datamoaLogger;
const datamoaModel = require('../Models/datamoaModel');
const {createResponseObj, createErrorMetaObj} = require('./commonService');


// Service
module.exports.getCategory = async (req, res, next) => {
  try {
    const pageCategory = new datamoaModel.PageCategory();
    const {rows} = await pageCategory.readAll();

    const responseResult = rows.map(row => {
      const pageIdAry = row.page_array
        .sort((a, b) => {
          return a.page_id - b.page_id;
        })
        .map(page => {
          return {
            pageId: page.page_id,
            pageTitle: page.page_name,
            pageUrl: page.page_url
          }
      });

      return {
        categoryId: row.category_id,
        categoryTitle: row.category_title,
        pageDataArray: pageIdAry
      }
    });

    const response = createResponseObj(responseResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }
}

module.exports.getSubpage = async (req, res, next) => {
  try {
    const page = new datamoaModel.Page();
    const {rows} = req.params.pageId ? await page.readById(req.params.pageId) : await page.readAll();

    const responseResult = rows.map(row => {
      console.log(row);
      return {
        pageId: row.page_id,
        pageTitle: row.page_name,
        pageUrl: row.page_url,
        pageDescription: row.page_description,
        categoryId: row.category_id,
        categoryTitle: row.category_name
      }
    });

    const response = createResponseObj(responseResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }
}

module.exports.postVoc = async (req, res, next) => {
  try {
    const voc = new datamoaModel.Voc();
    const result = await voc.create(req.body);

    const response = createResponseObj(req.body, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));

    console.log(err);
    next(err);
  }
}

module.exports.getVocCategory = async (req, res, next) => {
  try {
    const vocCategory = new datamoaModel.VocCategory();
    const {rows} = await vocCategory.readAll();

    const responseResult = rows.map(row => {
      return {
        vocCategoryId: row.voc_category_id,
        vocCategoryTitle: row.voc_category_name
      }
    });

    const response = createResponseObj(responseResult, 'ok', true);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err.message, createErrorMetaObj(err));
    next(err);
  }
}
