function requireLoggedOutUser(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    res.sendStatus(200);
}
///******you can add the function as an argument after the url route string*****

function requireNoSignature(req, res, next) {
    if (req.session.sigId);
}

function requireSignature(req, res, next) {
    if (req.session.sigId);
}

exports.requireNoSignature = requireNoSignature;
exports.requireSignature = requireSignature;
exports.requireLoggedOutUser = requireLoggedOutUser;
