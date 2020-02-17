const bcrypt = require('bcryptjs');
let  { genSalt, hash, compare } = bcrypt;
const { promisify } = require('util');

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

// genSalt().then ( salt => {
//     console.log('salt created by bcrypt:', salt); // generate salt to add for more PW security
//     return hash('safePassword', salt)
// }).then(hashedPassword => {
//     // console.log("hashedPw plus salt output", hashedPassword);// returns properly hashed pw
//     return compare('safePassword', hashedPassword); //clear Text value compares that one hashed to the one provided
// }).then(matchValueCompare => {
//     console.log('password provided is a match:', matchValueCompare);
// })

module.exports.compare = compare;
module.exports.hash = plainText => genSalt().then(salt=>(hash(plainText, salt)));
