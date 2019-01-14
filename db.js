const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

module.exports.addSignature = function(first, last, signature) {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)`,
        [first, last, signature]
    );
};

module.exports.getSigners = function() {
    return db.query(`SELECT first, last FROM signatures`).catch(err => {
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
//figure out how to take it from results and put it in the signatureId (in server)
