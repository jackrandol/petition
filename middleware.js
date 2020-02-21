function requireLoggedOutUser(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/petition");
    } else {
        next();
    }
}

function requireLoggedInUser(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/register');
    } else {
        next();
    }
}
///******you can add the function as an argument after the url route string*****

function requireNoSignature(req, res, next) {
    if (!req.session.sigId) {
        next();
    } else {
        return res.redirect('/thanks');
    }
}


function requireSignature(req, res, next) {
    if (req.session.sigId) {
        next();
    } else {
        return res.redirect('/petition');
    }
}

exports.requireNoSignature = requireNoSignature;
exports.requireSignature = requireSignature;
exports.requireLoggedInUser = requireLoggedInUser;
exports.requireLoggedOutUser = requireLoggedOutUser;
