const spicedPg = require("spiced-pg");
// const { dbUser, dbPass } = require("./secrets");
// const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

let db;
//if 'if' block runs, means our website sould talk to herokus postgres database
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbUser, dbPass } = require("./secrets");

    db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);
}

module.exports.addSignature = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature , user_id) VALUES ($1, $2) RETURNING id`,
        [signature, userId]
    );
};

module.exports.addProfile = (age, city, homepage, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [
            age ? Number(age) : null || null,
            city || null,
            homepage || null,
            userId
        ]
    );
};
//age ? Number(age) --> means user can only write a number, not a string

module.exports.getSigners = function() {
    return db.query(
        `SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        `
    );
};

module.exports.getSignersByCity = function(city) {
    return db.query(
        `
        SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id
        LEFT JOIN user_profiles
        ON signatures.user_id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1);
        `,
        [city]
    );
};

// module.exports.getSigners = function() {
//     //am i using it?
//     return db
//         .query(
//             `SELECT first, last FROM signatures
//         LEFT JOIN users
//         ON signatures.user_id = users.id`
//         )
//         .catch(err => {
//             console.log(err);
//         });

module.exports.getSig = function(sigId) {
    return db.query(
        `SELECT signature
       FROM signatures WHERE id = $1`,
        [sigId]
    );
};

module.exports.registerUser = (first, last, email, hash) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, hash]
    );
};

module.exports.getUserInfo = function(email) {
    return db.query(
        `SELECT *
        FROM users
        WHERE email = $1`,
        [email]
    );
};

module.exports.getUserPass = function(email) {
    return db.query(
        `SELECT password, users.id, signatures.id
        AS sig
        FROM users
        LEFT JOIN signatures
        ON signatures.user_id = users.id
        WHERE email = $1`,
        [email]
    );
};

module.exports.getUserId = function(email) {
    return db.query(
        `SELECT id
        FROM users
        WHERE email = $1`,
        [email]
    );
};

module.exports.editProfileInfo = function(id) {
    return db.query(
        `SELECT users.first AS first, users.last AS last, users.email AS email, p.age AS age, p.city AS city, p.url AS url
       FROM users
       LEFT JOIN user_profiles AS p
       ON users.id = p.user_id
       WHERE users.id = $1`,
        [id]
    );
};

module.exports.updateUserWithNewPass = function(
    first,
    last,
    email,
    hash,
    userId
) {
    return db.query(
        `UPDATE users
        SET first = $1, last = $2, email = $3, password = $4
        WHERE id = $5`,
        [first, last, email, hash, userId]
    );
};

module.exports.updateUserWithoutNewPass = function(first, last, email, userId) {
    return db.query(
        `UPDATE users
    SET first = $1, last = $2, email = $3
    WHERE id = $4`,
        [first, last, email, userId]
    );
};

module.exports.updateProfile = function(age, city, homepage, userId) {
    return db.query(
        `INSERT INTO user_profiles (age, city,  url, user_id)
	        VALUES ($1, $2, $3, $4)
	        ON CONFLICT (user_id)
	        DO UPDATE SET age = $1, city = $2, url = $3`,
        [
            age ? Number(age) : null || null,
            city || null,
            homepage || null,
            userId
        ]
    );
};

module.exports.deleteSig = function(userId) {
    return db.query(
        `DELETE 
       FROM signatures
       WHERE user_id = $1`,
        [userId]
    );
};
