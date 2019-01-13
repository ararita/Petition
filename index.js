const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const db = require("./db");

const hb = require("express-handlebars");
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.engine("handlebars", hb());

app.set("view engine", "handlebars");

app.use(require("cookie-parser")());
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
    res.render("signers", {
        layout: "main"
    });
});

app.post("/petition", function(req, res) {
    const firstName = req.body.first;
    const lastName = req.body.last;

    if (firstName && lastName) {
        // calldb();
        res.cookie("perdsonCookie", firstName + lastName);
        res.redirect("thanks");
        console.log(req.body);
    } else {
        res.render("petition", {
            layout: "main",
            error: "error"
        });
    }
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
