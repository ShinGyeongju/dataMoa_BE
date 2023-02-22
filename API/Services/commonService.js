
// Default response object
module.exports.createResponseObj = (result, message, success) => {
  return {
    result: result || {},
    message: message || '',
    success: success || false
  }
}

// Default error log object
module.exports.createErrorMetaObj = (err) => {
  return {
    code: err.code || '10000',
    stack: err.stack || ''
  };
}

// Default page
module.exports.defaultPage = (req, res, next) => {
  //res.status(404)
  console.log('default pages');

  res.redirect('/');
}

// Default error handler
const errorCodeArray_400 = ['22001', '23502', '23503'];

module.exports.defaultErrorHandler = (err, req, res, next) => {
  console.log(err);


  err.code = err.code || '10000';
  err.statusCode = errorCodeArray_400.includes(err.code) ? 400 : 500;

  const response = this.createResponseObj({}, err.code, false);

  res.status(err.statusCode).json(response);
}
