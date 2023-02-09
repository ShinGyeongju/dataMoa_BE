
module.exports.defaultPage = (req, res, next) => {
  //res.status(404)
  console.log('default pages');

  res.redirect('/');
}

module.exports.defaultErrorHandler = (err, req, res, next) => {
  //res.status(500)
  console.log('default errors');

}