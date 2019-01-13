const spicedPg = require("spiced-pg");
const { dbUser, dbPass } = require("./secrets");
const db = spicedPg(
    "postgres:postgres:postgres@localhost:5432/petition"

    //ovaj drugi postgress je user a treci je password, ali bolje je nemat osobne podatke u kodu i commit them, zato radimo secerts.json, ali prije toga idemo u git ignore i navedemo tamo secrets.json
);

db.query(
    //`INSERT INTO cities (city, population)
    //VALUE ('Gotham': 1000001)
    //RETURNING *`
    //this means when we insert only uts omething into database, but returning we need to see it; its useful cause we can see the id;
    `SELECT * FROM petition
    WHERE population > 15000`
)
    .then(({ rows }) => {
        //rerturns a promise, or pass the callback; 3 arguments, first one is a query
        console.log(rows);
    })
    .catch(err => console.log(err)); //the promise will not be resolved if theres an error;

// for the prject: create a file, maybe db.js, and in thetre cretae fns that call, put your db stuff in module. so oither codes need to know nothing about postgres
module.exports.addCity = function(city, country, population) {
    return db.query(
        `INSERT INTO petition (city, country, population)
        VALUES($1, $2, $3)`
        //ali ovo je hardcoded, we need to do it safe, node postgres module can do it for us:
        // in db.query:
        // VALUES($1, $2, $3)
        //[city, country, population]
        //any time we use parameters, we shall do it this way, not for expamle VALUES ({$city}) etc
    );
    //     module.exports.addCity = function(city, country, population) {
    //         return db.query(`DELETE FROM cities WHERE id = $1`, [id])
};
