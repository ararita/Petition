const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

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

module.exports.getSigners = function() {
    return db
        .query(
            `SELECT first, last FROM signatures
        LEFT JOIN users
        ON signatures.user_id = users.id`
        )
        .catch(err => {
            console.log(err);
        });
};

// module.exports.signPetition = function(first, last, signature) {
//     return db.query(
//         `INSERT INTO signatures (first, last, signature)
//         VALUES ($1, $2, $3) RETURNING id
//         `,
//         [first, last, signature]
//     );
// };

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
        `SELECT password, id
        FROM users
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
