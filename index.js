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
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireSignature,
    requireNoSignature
} = require("./middleware");

app.engine("handlebars", hb());

app.set("view engine", "handlebars");

// app.use(express.static("./db"));
app.use(express.static("./public"));
app.use(express.static("./public/assets"));
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
    } else {
        checkedUrl = null;
    }
    return checkedUrl;
}

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    if (req.body.password === "") {
        return res.render("register", {
            layout: "main",
            registrationErrorMessage:
                "Oops there was an error with your registration. Please make sure to complete all input fields."
        });
    } else {
        hash(req.body.password).then(hashedPassword => {
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
    }
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profile", {
        layout: "mainLoggedIn"
    });
});

app.post("/profile", (req, res) => {
    if (!req.body.city && !req.body.url && !req.body.age) {
        return res.redirect("/petition");
    }

    let userUrl = urlCheck(req.body.url);

    db.addProfileInfo(req.body.age, req.body.city, userUrl, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("profile", {
                layout: "mainLoggedIn",
                profileErrorMessage:
                    "Oops there was an error with your profile. Maybe you have already entered profile information or used a url that doesn't begin with http://, https:// or //."
            });
        });
});

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.getUserInfo(req.session.userId).then(response => {
        var userInfo = response.rows[0];
        console.log("userInfo", userInfo);
        res.render("profileEdit", {
            layout: "mainLoggedIn",
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
                            layout: "mainLoggedIn",
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
                        layout: "mainLoggedIn",
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
                            layout: "mainLoggedIn",
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
                        layout: "mainLoggedIn",
                        profileEditErrorMessage:
                            "There was an error updating your profile"
                    });
                });
        });
    }
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    const userPWInput = req.body.password;
    db.getPassword(req.body.email)
        .then(results => {
            console.log("results.rows:", results.rows);
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
                                if (sigResponse.rowCount === 0) {
                                    console.log("redirected to petition");
                                    res.redirect("/petition");
                                } else {
                                    console.log(
                                        "users sigId for cookie is:",
                                        sigResponse.rows[0].id
                                    );
                                    req.session.sigId = sigResponse.rows[0].id;
                                    res.redirect("/thanks");
                                    console.log("redirected to thanks");
                                }
                            }
                        );
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

app.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    const { userId } = req.session;
    db.addSigners(req.body.signature, userId)
        .then(response => {
            req.session.sigId = response.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("petition", {
                layout: "main",
                message:
                    "There was an error with your signature, are you sure you signed?"
            });
        });
});

app.get("/thanks", requireSignature, (req, res) => {
    var signatureImage;
    db.getSignature(req.session.userId)
        .then(response => {
            signatureImage = response.rows[0].signature;
            res.render("thanks", {
                layout: "mainLoggedIn",
                signatureImage
            });
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("thanks", {
                layout: "mainLoggedIn",
                thanksErrorMessage: "oops there was an error here"
            });
        });
});

app.post("/thanks", (req, res) => {
    res.redirect("/signers");
});

app.post("/signature/delete", (req, res) => {
    console.log("signature deleted!!!!!!!");
    db.deleteSignature(req.session.userId);
    req.session.sigId = null;
    res.redirect("/petition");
});

app.get("/signers", requireSignature, (req, res) => {
    db.getSigners().then(response => {
        var signers = response.rows;
        res.render("signers", {
            layout: "mainLoggedIn",
            signers
        });
    });
});

app.get("/signers/:city", requireSignature, (req, res) => {
    var city = req.params.city;
    db.getSignersByCity(city)
        .then(response => {
            var signers = response.rows;
            res.render("signers", {
                layout: "mainLoggedIn",
                signers,
                city
            });
        })
        .catch(error => {
            console.log("error in catch:", error);
            res.render("signers", {
                layout: "mainLoggedIn",
                signersByCityErrorMessage: "oops there was an error here"
            });
        });
});

app.post("/logout", (req, res) => {
    req.session.sigId = null;
    req.session.userId = null;
    res.redirect("petition");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("petition running . . .")
    );
}
