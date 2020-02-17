const express = require("express");
const app = express();
const db = require("./utils/db.js");
const hb = require("express-handlebars");
// const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
//this allows us to have tamperproof cookies

const csurf = require("csurf");
const { hash, compare } = require("./utils/bc.js");

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

///Bcrypt stuff- registering users

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("register", {
            layout: "main"
        });
    }
});

app.post("/register", (req, res) => {
    hash(req.body.password).then(hashedPassword => {
        //add to user table we create
        // console.log("hashed PW from /register", hashedPassword);
        //we need to store this in your DB table
        //without the sendStatus the page would just load infinitely, message sent back to client side
        //you will want to redirect and not send a success status
        db.addUser(
            req.body.first,
            req.body.last,
            req.body.email,
            hashedPassword
        )
            .then(response => {
                req.session.userId = response.rows[0].id;
                req.session.first = response.rows[0].first;
                req.session.last = response.rows[0].last;
                req.session.email = response.rows[0].email;
                console.log(
                    "req.session after signer id cookie set",
                    req.session
                );
                res.redirect("/petition");
            }).catch(error => {
                console.log("error in catch:", error);
                res.render("register", {
                    layout: "main",
                    registrationErrorMessage:
                        "Oops there was an error with your registration. Please make sure to complete all input fields."
                });
            });
    });
});

app.get("/login", (req, res) => {
    const { userId } = req.session;
    if(userId) {
        res.redirect('/petition');
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/login", (req, res) => {
    //use compare, two args, 1st is password from the user input and second is the hashedPW from the database
    //if these pw match ompare returns true, otherwise it returns false
    console.log("post to login was made");
    console.log("req.body.email:", req.body.email);
    //this is all hardcoded, we need to actually get whats in the database table
    const userPWInput = req.body.password;
    ///get the password from db.js
    db.getPassword(req.body.email).then(results => {
        console.log("results from getpassword:", results);

        compare(userPWInput, results.rows[0].password)
            .then(matchValue => {
                console.log("matchValue of compare:", matchValue);

                if (matchValue == true) {
                    req.session.userId = results.rows[0].id;
                    db.checkUserSig(results.rows[0].id).then(sigResponse => {
                        console.log("sigResponse:", sigResponse);
                        if(sigResponse.rowCount == 0) {
                            res.redirect('/petition');
                        } else if (sigResponse.rowCount == 1) {
                            res.redirect('/thanks');
                        }
                    });
                    console.log('req.session.userId after cookie:', req.session.userId);

                } else {
                    res.render('login', {
                        layout: 'main',
                        loginErrorMessage:
                            "The email or password you have entered are incorrect."
                    });

                }
            })
            .catch(error => {
                console.log("error in catch:", error);
                res.render("login", {
                    layout: "main",
                    loginErrorMessage:
                        "The email or password you have entered are incorrect."
                });
            });
        //if the password matches, redirect to /petition, will want to set req.session.userId
        //if PW does not match we will want to trigger or send an error msg
    });
});

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else if (req.session.userId) {
        res.render("petition", {
            layout: "main"
        });
    } else {
        // req.session starts off life as an empty object
        //req.session = null to clear session
        // console.log("req.session: ", req.session);
        //lets add something to the cookies, adding key allspice and value <3
        //req.session.allspice = "<3";
        // console.log("session obj in petition route:", req.session);

        res.redirect("/register");
    }
});

//redirect to /thanks if there's a cookie
//do insert of submitted data into database
// if there is an error, petition.handlebars is rendered with an error message
// if there is no error
// sets cookie to remember
// redirects to thank you page

app.post("/petition", (req, res) => {
    const { userId } = req.session;
    // console.log("req.body.signature,", req.body.signature);

    db.addSigners(req.body.signature, userId)
        .then(response => {
            // console.log("req.session: ", req.session);
            req.session.sigId = response.rows[0].id;
            // console.log("req.session after signer id cookie set", req.session);

            res.redirect("/thanks");
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("petition", {
                layout: "main",
                message:
                    "Oops there was an error. Please make sure to complete all input fields."
            });
        });
});

app.get("/thanks", (req, res) => {
    // console.log("req.session.userId:", req.session.userId);
    var signatureImage;
    db.getSignature(req.session.userId).then(response => {
        console.log("req.session:", req.session);
        signatureImage = response.rows[0].signature;
        // console.log('signature from promise:', signatureImage);
        res.render("thanks", {
            layout: "main",
            signatureImage
        });
    }).catch(error => {
        console.log('error in catch:', error);
    });
});

app.post("/thanks", (req, res) => {
    res.redirect("/signers");
});

app.get("/signers", (req, res) => {
    db.getSigners().then(response => {
        var signers = response.rows;
        res.render("signers", {
            layout: "main",
            signers
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
