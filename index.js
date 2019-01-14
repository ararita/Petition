const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const db = require("./db");

const hb = require("express-handlebars");
const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.engine("handlebars", hb());

app.set("view engine", "handlebars");

// app.use(require("cookie-parser")()); --ovo ne trebamo vise jer koristimo cookie session middleware
app.use(express.static(__dirname + "/public"));

//1. GET /petition
// * renders petition template

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(function(signers) {
            res.render("signers", {
                signers: signers.rows,
                layout: "main"
            });
        })
        .catch(function(err) {
            res.render("petition", {
                layout: "main",
                error: "error"
            });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});
app.post("/petition", function(req, res) {
    const firstName = req.body.first;
    const lastName = req.body.last;
    const signature = req.body.signature;

    if (firstName && lastName) {
        db.addSignature(firstName, lastName, signature);
        // calldb();
        res.cookie("personCookie", firstName + lastName);
        res.redirect("thanks");
        console.log(req.body);
    } else {
        res.render("petition", {
            layout: "main",
            error: "error"
        });
    }
});

//send user info to sql table
db.signPetition(signature).then(function() {
    // take the id that INSERT query generates and put that in cookie, isntead of putting 1
    req.session.signatureId = 1;
    //req.session.first = "vesna"; ali trebamo samo id(iznad)
    console.log("req.session ", req.session);
    res.redirect("/thanks");
});

//run a function from db that insert first last and signture in datadase
//.then( redirect /thanks)
//.catch( res.render(/petition))

// db.addCity(req.body.city, req.body.country, req.body.pop).then(() => {
//     res.render('success');
// }).catch(err => {
//     console.log(err);
//     res.render('error')
// });

app.listen(8080, () => console.log("listening"));
