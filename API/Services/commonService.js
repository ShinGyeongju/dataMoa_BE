
// Default response object
module.exports.createResponseObj = (result, message, success) => {
  return {
    result: result || {},
    message: message || '',
    success: success || false
  }
}

// Default page
module.exports.defaultPage = (req, res, next) => {
  //res.status(404)
  console.log('default pages');

  res.redirect('/');
}

// Default error handler
module.exports.defaultErrorHandler = (err, req, res, next) => {
  const response = this.createResponseObj({}, err.code, false);

  res.status(500).json(response);
}
