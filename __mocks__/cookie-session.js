let tempSession, session = {};

module.exports = () => (req, res, next) => {
    req.session = tempSession || session;
    tempSession = null;
    next();
};


//mockSession will allow us to write data to a cookie in our tests, and data
//written to the cookie will exist across multiple tests
module.exports.mockSession = sess => session = sess;

///mockSessionOnce will allow us to write data to a cookie in our test,
//but that cookie will only exist for ONE deleteSignature
module.exports.mockSessionOnce = sess => tempSession = sess;
