const crypto = require('crypto');
const {serverConfig} = require('../../Common/config');


// HMAC Authorization
module.exports.HMACAuthorization = (req, res, next) => {
  const authHeader = req.header('Authorization').split(' ');
  const currentTime = Date.now();

  try {
    if (authHeader[0].toUpperCase() !== 'HMAC') {
      const response = this.createResponseObj({}, '[10010] Authentication failed - Invalid identifier', false);
      res.status(401).json(response);
      return;
    }

    const authHeaderValue = authHeader[1].split(':');
    const interval = currentTime - authHeaderValue[0];

    if (interval > 300000) {
      const response = this.createResponseObj({}, '[10011] Authentication failed - Invalid epoch time', false);
      res.status(401).json(response);
      return;
    }

    const hmac = crypto.createHmac('sha256', serverConfig.apiAuthSecret);
    hmac.update(authHeaderValue[0]);
    hmac.update(req.method);
    hmac.update(req._parsedUrl.pathname);
    const digest = hmac.digest('hex');
    console.log(digest);
    if (digest !== authHeaderValue[1]) {
      const response = this.createResponseObj({}, '[10012] Authentication failed - Invalid hash code', false);
      res.status(401).json(response);
      return;
    }

    next();
  } catch (err) {
    console.log(err);
    const response = this.createResponseObj({}, '[10013] Authentication failed', false);
    res.status(401).json(response);
  }
}

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

  if (err.code === 'ERR_HMAC_AUTH_INVALID') {
    const response = this.createResponseObj({}, '401 - Authentication failed', false);
    res.status(401).json(response);
    return;
  }

  err.code = err.code || '10000';
  err.statusCode = errorCodeArray_400.includes(err.code) ? 400 : 500;

  const response = this.createResponseObj({}, err.code, false);

  res.status(err.statusCode).json(response);
}
