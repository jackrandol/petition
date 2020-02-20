const express = require("express");

const app = express();
exports.app = app;
const db = require("./utils/db.js");
const hb = require("express-handlebars");
// const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
//this allows us to have tamperproof cookies

const csurf = require("csurf");
const { hash, compare } = require("./utils/bc.js");
const { requireSignature, requireNoSignatures } = require("./middleware");

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

app.use((req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
});

// app.use('/auth', (req, res, next) => {
//     //can also put a string there and then add to app.post/get (app.get('/auth/register')) for example
// });

// function requireLoggedOutUser(req, res, next) {
//     if (req.session.userId) {
//         return res.redirect('/petition');
//     }
//     res.sendStatus(200);
// }
///******you can add the function as an argument after the url route string*****

//function requireNoSignatures(req, res, next) {
// if(req.session.sigId)
// }

// function requireSignature (req, res, next) {
//     if (req.session.sigId)
// }
// app.get("/register", requireLoggedOutUser, (req, res) => {
//     if (req.session.userId) {
//         res.redirect("/petition");
//     } else {
//         res.render("register", {
//             layout: "main"
//         });
//     }
// });

///stubs are all the app.gets and app.posts

///Bcrypt stuff- registering users

//make app.get('/') and redirect to petition

function urlCheck(userInputUrl) {
    var checkedUrl = userInputUrl;
    if (
        userInputUrl.startsWith("http://") ||
        userInputUrl.startsWith("https://") ||
        userInputUrl.startsWith("//")
    ) {
        checkedUrl = userInputUrl;
        // console.log('url is good');
    } else {
        checkedUrl = null;
    }
    return checkedUrl;
}

app.get("/", (req, res) => {
    res.redirect("/petition");
});

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
                res.redirect("/profile");
            })
            .catch(error => {
                console.log("error in catch:", error);
                res.render("register", {
                    layout: "main",
                    registrationErrorMessage:
                        "Oops there was an error with your registration. Please make sure to complete all input fields."
                });
            });
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    if (!req.body.city && !req.body.url && !req.body.age) {
        res.redirect("/petition");
    }

    let userUrl = urlCheck(req.body.url);

    db.addProfileInfo(req.body.age, req.body.city, userUrl, req.session.userId)
        .then(() => {
            // console.log('data entered into userProfiles');
            res.redirect("/petition");
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("profile", {
                layout: "main",
                profileErrorMessage:
                    "Oops there was an error with your profile. Maybe you have already entered profile information or used a url that doesn't begin with http://, https:// or //."
            });
        });
});

app.get("/profile/edit", (req, res) => {
    db.getUserInfo(req.session.userId).then(response => {
        var userInfo = response.rows[0];
        console.log("userInfo", userInfo);

        res.render("profileEdit", {
            layout: "main",
            userInfo
        });
    });
});

app.post("/profile/edit", (req, res) => {
    console.log("req.body from profile edit:", req.body);
    console.log("req.session.userId from profile edit:", req.session.userId);
    let checkedUrl = urlCheck(req.body.url);

    if (req.body.password) {
        hash(req.body.password).then(hashedPassword => {
            db.updateUsersWithPassword(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPassword,
                req.session.userId
            )
                .then(response => {
                    console.log(
                        "response from profile edit with PW:",
                        response
                    );
                    db.updateUserProfile(
                        req.body.age,
                        req.body.city,
                        checkedUrl,
                        req.session.userId
                    );
                    db.getUserInfo(req.session.userId).then(response => {
                        var updatedUserInfo = response.rows[0];
                        console.log("userInfo", updatedUserInfo);

                        res.render("profileEdit", {
                            layout: "main",
                            updatedUserInfo
                        });
                    });
                })
                .catch(error => {
                    console.log(
                        "error in catch from updateuserprofile w/oPw",
                        error
                    );
                    res.render("profileEdit", {
                        layout: "main",
                        profileEditErrorMessage:
                            "There was an error updating your profile"
                    });
                });
        });
    } else {
        db.updateUsers(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        ).then(response => {
            console.log("response from profile edit w/o PW:", response);
            db.updateUserProfile(
                req.body.age,
                req.body.city,
                checkedUrl,
                req.session.userId
            )
                .then(() => {
                    console.log("userProfile was updated");
                    db.getUserInfo(req.session.userId).then(response => {
                        var updatedUserInfo = response.rows[0];
                        console.log("userInfo", updatedUserInfo);

                        res.render("profileEdit", {
                            layout: "main",
                            updatedUserInfo
                        });
                    });
                })
                .catch(error => {
                    console.log(
                        "error in catch from updateuserprofile w/oPw",
                        error
                    );
                    res.render("profileEdit", {
                        layout: "main",
                        profileEditErrorMessage:
                            "There was an error updating your profile"
                    });
                });
        });
    }
});

app.get("/login", (req, res) => {
    const { userId } = req.session;
    if (userId) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/login", (req, res) => {
    //use compare, two args, 1st is password from the user input and second is the hashedPW from the database
    //if these pw match ompare returns true, otherwise it returns false

    //this is all hardcoded, we need to actually get whats in the database table
    const userPWInput = req.body.password;
    ///get the password from db.js
    db.getPassword(req.body.email)
        .then(results => {
            console.log("results from getpassword:", results);
            console.log("userPWInput:", userPWInput);

            compare(userPWInput, results.rows[0].password)
                .then(matchValue => {
                    console.log("matchValue of compare:", matchValue);

                    if (matchValue == true) {
                        req.session.userId = results.rows[0].id;
                        console.log(
                            "req.session.userId after true match:",
                            req.session.userId
                        );
                        db.checkUserSig(results.rows[0].id).then(
                            sigResponse => {
                                console.log("sigResponse:", sigResponse);
                                if (sigResponse.rows == 0) {
                                    res.redirect("/petition");
                                } else if (sigResponse.rows == 1) {
                                    res.redirect("/thanks");
                                }
                            }
                        );
                        // console.log('req.session.userId after cookie:', req.session.userId);
                    } else {
                        res.render("login", {
                            layout: "main",
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
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("login", {
                layout: "main",
                loginErrorMessage:
                    "The email or password you have entered are incorrect."
            });
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
    console.log("req.session in get route thanks", req.session);
    var signatureImage;
    db.getSignature(req.session.userId)
        .then(response => {
            console.log("req.session:", req.session);
            signatureImage = response.rows[0].signature;
            if (signatureImage) {
                // console.log('signature from promise:', signatureImage);
                res.render("thanks", {
                    layout: "main",
                    signatureImage
                });
            } else if (!signatureImage) {
                res.redirect("/petition");
            }
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("thanks", {
                layout: "main",
                thanksErrorMessage: "oops there was an error here"
            });
        });
});

app.post("/thanks", (req, res) => {
    res.redirect("/signers");
});

app.post("/signature/delete", (req, res) => {
    db.deleteSignature(req.session.userId);
    req.session.sigId = null;
    res.redirect("/petition");
});

app.get("/signers", (req, res) => {
    db.getSigners().then(response => {
        console.log("signers query response.rows:", response.rows);
        var signers = response.rows;

        res.render("signers", {
            layout: "main",
            signers
        });
    });
    //select signatures from signatures table and then join users with first and last name
    //we also want to display age city and url
    //here's where there should be a db.query to get the cookie with the user id and
    //render it back on the page
});

app.get("/signers/:city", (req, res) => {
    var city = req.params.city;
    console.log("req.params from /signers/:city", req.params.city);
    db.getSignersByCity(city)
        .then(response => {
            console.log("response from getSignersByCity:", response);
            var signers = response.rows;
            res.render("signers", {
                layout: "main",
                signers
            });
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("signers", {
                layout: "main",
                signersByCityErrorMessage: "oops there was an error here"
            });
        });
});

///supertest/////

// app.get("/welcome", (req, res) => {
//     res.send('<h1>HIIIII</h1>');
// });

// app.post("/welcome", (req, res) => {
//     req.session.submitted = true;
//     res.redirect("/home");
// });

// app.get("/house", (req, res) => {
//     if (!req.session.submitted) {
//         return res.redirect("/welcome");
//     }
//     console.log('req.session in GET /house route:', req.session);
//     res.send("<h1>house</h1>");
// });

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("petition running . . .")
    );
}
// new get route for profile
//new template for profile
//check url before inserting into database
