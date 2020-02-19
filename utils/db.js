const spicedPg = require("spiced-pg");
// const secrets = require('./secrets');
// you can leave the // after postgres: if you want

const db = spicedPg(`postgres://postgres:postgres@localhost:5432/signatures`);

//postgres will only do 10 connections to the database at once, like with each js file
//it forms a connection for each file
//spicepg manages all the connections
// const addSigners =

exports.addUser = function(first, last, email, password) {
    console.log('data inserted into users DB table!');

    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first, last, email, password`,
        [first, last, email, password]
    );
};

exports.addSigners = function(signature, user_id) {

    console.log('data inserted into DB!');

    return db.query(
        `INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        //when we use returning it will give us back the id of the user that
        //was just inserted
        [signature, user_id]
    );
};

exports.getPassword = function(inputEmail) {
    return db.query(
        `SELECT password, id FROM users WHERE email = $1`,
        [inputEmail]
    );
};

//also need to get the signature ID here

exports.addProfileInfo = function(age, city, url, userId) {
    return db.query(
        `INSERT INTO userProfiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)`,
        [age, city, url, userId]
    );
};

exports.checkUserSig = function(userId) {
    return db.query(
        `SELECT signature FROM signatures WHERE user_id = $1`,
        [userId]
    );
};

// INSERT INTO signatures (first, last, signature) VALUES ('jack', 'randol', 'sig');

//this should get the first and last names of all signers
exports.getSigners = function() {
    return db.query(
        `SELECT signatures.signature AS signature, users.first AS first, users.last AS last, userProfiles.url AS url, userProfiles.age AS age, userProfiles.city AS city
        FROM signatures
        LEFT JOIN users
        ON users.id = signatures.user_id
        LEFT JOIN userProfiles
        ON signatures.user_id = userProfiles.user_id`
    );
};

exports.getSignersByCity = function(city) {
    return db.query(
        `SELECT signatures.signature AS signature, users.first AS first, users.last AS last, userProfiles.url AS url, userProfiles.age AS age, userProfiles.city AS city
        FROM signatures
        LEFT JOIN users
        ON users.id = signatures.user_id
        LEFT JOIN userProfiles
        ON signatures.user_id = userProfiles.user_id
        WHERE userProfiles.city = $1`,
        [city]

    );
};

exports.getSignature = function(sigId) {
    return db.query(
        `SELECT signature FROM signatures WHERE user_id = $1`,
        [sigId]
    );
};

////don't put a variable for denver in the query above, people can input code instead of just
//a city variable and they will actually cause something to happen in your code
//solution is escape characters  to put all the info as a string, the dollar sign
//items are how to use node pg's work around for this
///ALWAYS $1, $2 etc for using parameters in a query...


//
// addCity('Paris', 'France', 3000000).then(
//     ({rows}) => {
//         console.log(rows);
//         return db.query(`SELECT city AS name, population AS "numPeeps" FROM cities`);
//     }
// );

// db.query(`SELECT city AS name, population AS "numPeeps" FROM cities`).then(
//     ({rows}) => {
//         console.log(rows);
//     }
// );

//all of SELECT UPDATE and stuff will be done in node

///first page has three input fields, two for name, the canvas field will have type private
//hidden form field for putting the image data
//how to get that image data from the canvas

// var c = document.querySelector('canvas');

// c.toDataUrl();
//this is a method that canvas has to get the data which is like a png url
// the data url should be in the value of the hidden field you have
//this is the only client side javascript we need for this project
//this will make it so the user can draw on the canvas
//when mouse goes down you draw a line from point where it began and to the event object x,y
// where it has gone.

//it also have to grab the url with canvas.toDataUrl with jquery it's something like
// $('input#signature').val)
//     $('canvas')[0].toDataUrl()
// );
//when to grab the toDataUrl, when the user draws a new line its good to update this data




// {{#if error}}
// <div class="error">Oops!</div>
// {{/if}}

// <form method="POST">
//     <input name="first">
//     <input name="last">
//     <input type="hidden" id='signature' name='signature'>
//
// </form>

// homepage generates from handlebars
//you'll have a views page etc....
//it needs to be a template, so that if the user enters something wrong they can


//url encoded for the request.body
//do the redirect stuff lastttttt


// we want to set a cookie if someone has signed
