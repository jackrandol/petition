const spicedPg = require("spiced-pg");

const db = spicedPg(process.env.DATABASE_URL || `postgres://postgres:postgres@localhost:5432/signatures`);

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
        [signature, user_id]
    );
};

exports.deleteSignature = function(user_id) {
    console.log('signature deleted!!!!!');
    return db.query(
        `DELETE FROM signatures WHERE user_id = $1`,
        [user_id]
    );
};

exports.getPassword = function(inputEmail) {
    return db.query(
        `SELECT password, id FROM users WHERE email = $1`,
        [inputEmail]
    );
};

exports.addProfileInfo = function(age, city, url, userId) {
    return db.query(
        `INSERT INTO userProfiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)`,
        [age || null, city || null, url || null , userId]
    );
};

exports.checkUserSig = function(userId) {
    return db.query(
        `SELECT signature, id FROM signatures WHERE user_id = $1`,
        [userId]
    );
};

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

exports.getUserInfo = function(userId) {
    return db.query(
        `SELECT users.first AS first, users.last AS last, userProfiles.url AS url, userProfiles.age AS age, userProfiles.city AS city, users.email AS email
        FROM users
        LEFT JOIN userProfiles
        ON userProfiles.user_id = users.id
        WHERE users.id = $1`,
        [userId]
    );
};

exports.updateUsers = function(first, last, email, userId) {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email = $3
        WHERE id = $4`,
        [first, last, email, userId]
    );
};

exports.updateUsersWithPassword = function(first, last, email, hashedPassword, userId) {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email = $3, password = $4
        WHERE id = $5`,
        [first, last, email, hashedPassword, userId]
    );
};

exports.updateUserProfile = function(age, city, url, user_id) {
    return db.query(
        `INSERT INTO userProfiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO
        UPDATE SET age = $1, city = $2, url = $3`,
        [age || null, city || null, url || null, user_id]
    );
};
