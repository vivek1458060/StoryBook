module.exports = (req, res, next) => {

  var token = req.body.myStoryToken;
  console.log(token);

  if(token) {

    req.headers['x-auth'] = token;
    next();
  } else {
    res.status(401).send();
  }
}
