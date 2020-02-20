// function requireLoggedOutUser(req, res, next) {
//     if (req.session.userId) {
//         return res.redirect('/petition');
//     }
//     res.sendStatus(200);
// }
///******you can add the function as an argument after the url route string*****

//function requireNoSignatures(req, res, next) {
    // if(req.session.sigId)
 // }

 // function requireSignature (req, res, next) {
 //     if (req.session.sigId)
 // }

 exports.requireNoSignatures = require.Signature;
