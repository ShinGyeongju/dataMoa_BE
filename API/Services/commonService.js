const crypto = require('crypto');
const {serverConfig} = require('../../Common/config');
const fs = require('fs');
const path = require("path");


// HMAC Authorization
module.exports.HMACAuthorization = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      const response = this.createResponseObj({}, '[10010] Authentication failed - Authorization not found', false);
      res.status(401).json(response);
      return;
    }

    const splitAuthHeader = authHeader.split(' ');
    const currentTime = Date.now();

    if (splitAuthHeader[0].toUpperCase() !== 'HMAC') {
      const response = this.createResponseObj({}, '[10011] Authentication failed - Invalid identifier', false);
      res.status(401).json(response);
      return;
    }

    const authHeaderValue = splitAuthHeader[1].split(':');
    const interval = currentTime - authHeaderValue[0];

    if (interval > 300000) {
      const response = this.createResponseObj({}, '[10012] Authentication failed - Invalid epoch time', false);
      res.status(401).json(response);
      return;
    }

    const hmac = crypto.createHmac('sha256', serverConfig.apiAuthSecret);

    hmac.update(authHeaderValue[0]);
    hmac.update(req.method);
    hmac.update(req.baseUrl + req._parsedUrl.pathname);
    const digest = hmac.digest('hex');

    if (digest !== authHeaderValue[1]) {
      const response = this.createResponseObj({}, '[10013] Authentication failed - Invalid hash code', false);
      res.status(401).json(response);
      return;
    }

    next();
  } catch (err) {
    console.log(err);
    const response = this.createResponseObj({}, '[10014] Authentication failed', false);
    res.status(401).json(response);
  }
}

// Replace HTML value
module.exports.replaceHTML = (html, option) => {
  let r = html.replace(/<title>[\s\S]*<\/title>/i, `<title>${option.title}</title>`);

  const iconIndex = r.indexOf('x-icon" href="') + 'x-icon" href="'.length;
  r = r.substring(0, iconIndex) + option.icon + r.substring(r.indexOf('"', iconIndex), r.length);

  const titleIndex= r.indexOf('og:title" content="') + 'og:title" content="'.length;
  r = r.substring(0, titleIndex) + option.title + r.substring(r.indexOf('"', titleIndex), r.length);

  const urlIndex = r.indexOf('og:url" content="') + 'og:url" content="'.length;
  r = r.substring(0, urlIndex) + option.url + r.substring(r.indexOf('"', urlIndex), r.length);

  const descriptionIndex = r.indexOf('content="', r.indexOf('og:description')) + 'content="'.length;
  r = r.substring(0, descriptionIndex) + option.description + r.substring(r.indexOf('"', descriptionIndex), r.length);

  return r;
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
  res.sendfile(path.join(__dirname, '../Views/build/index.html'));
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
