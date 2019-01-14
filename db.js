const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/petition`);

// module.exports.addSignature = (userFirstName, userLastName, sig) => {
//     return db.query(
//         `INSERT INTO signatures (userFirstName,userLastName, sig) VALUES ($1, $2, $3)`,
//         [userFirstName, userLastName, sig]
//     );
// };

module.exports.signPetition = function(first, last, sig) {
    return db.query(
        `INSERT INTO signatures (first, last, signature)
        VALUES ($1, $2, $3) RETURNING id
        `,
        [first || null, last || null, sig || null]
    );
};
