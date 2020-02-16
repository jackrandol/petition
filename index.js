const express = require("express");
const app = express();
const db = require("./db.js");
const hb = require("express-handlebars");
// const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
//this allows us to have tamperproof cookies

const csurf = require("csurf");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//
// app.use(express.static("./db"));
app.use(express.static("./public"));
// app.use(cookieParser());
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
        ///this is the cookie session time, here we set it for two weeks
    })
);

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    ///this will put csrftoken in all of the routes
    next();
});

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        // req.session starts off life as an empty object
        //req.session = null to clear session
        console.log("req.session: ", req.session);
        //lets add something to the cookies, adding key allspice and value <3
        // req.session.allspice = "<3";
        console.log("session obj in petition route:", req.session);

        res.render("petition", {
            layout: 'main'
        });
    }
});

//redirect to /thanks if there's a cookie
//do insert of submitted data into database
// if there is an error, petition.handlebars is rendered with an error message
// if there is no error
// sets cookie to remember
// redirects to thank you page

app.post("/petition", (req, res) => {
    // console.log("req.body.first,", req.body.first);
    // console.log("req.body.last", req.body.last);

    db.addSigners(req.body.first, req.body.last, req.body.signature)
        .then(response => {
            console.log("response.rows[0].id", response.rows[0].id);

            console.log("****************post made**********");
            console.log("req.session: ", req.session);
            req.session.sigId = response.rows[0].id;
            console.log("req.session after signer id cookie set", req.session);

            res.redirect("/thanks");
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("petition", {
                layout: null,
                message: "Oops there was an error. Try Again"
            });
        });
});


app.get('/thanks', (req, res) => {
    console.log("req.session.sigId:", req.session.sigId);
    var signatureImage;
    db.getSignature(req.session.sigId).then(response =>{
        signatureImage = response.rows[0].signature;
        // console.log('signature from promise:', signatureImage);
        res.render('thanks', {
            layout: 'main',
            signatureImage
        });

    });
});


app.post('/thanks', (req, res) => {
    res.redirect('/signers');
});

app.get("/signers", (req, res) => {


    db.getSigners().then(response => {


        var signers = response.rows;
        res.render('signers', {
            layout: 'main',
            signers,
        });
    });
    //here's where there should be a db.query to get the cookie with the user id and
    //render it back on the page
});

app.listen(8080, () => console.log("petition running . . ."));

// for adding signers
// db.addSigner(req.body.first, req.body.last, req.body.signature)
//     .then()
//     .catch()
