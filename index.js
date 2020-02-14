const express = require('express');
const app = express();
const db = require('./db');
const hb = require('express-handlebars');
const cookieParser = require('cookie-parser');



app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
//
// app.use(express.static("./db"));
app.use(express.static('./public'));
app.use(cookieParser());
app.use(
    express.urlencoded({
        extended: false
    })
);

app.get('/petition', (req, res) => {

    res.render('petition', {
        layout: null,
    });
});


//redirect to /thanks if there's a cookie
//do insert of submitted data into database
// if there is an error, petition.handlebars is rendered with an error message
// if there is no error
// sets cookie to remember
// redirects to thank you page

app.post('/petition', (req, res) => {

    // res.send(console.log("req.body:", req.body));
    // console.log('res.body:', res.body);
    
    res.redirect('/thanks');


});

app.get('/thanks', (req, res) => {

    res.render('thanks', {
        layout: null,

    });
});

app.listen(8080, () => console.log ('petition running . . .'));

// for adding signers
// db.addSigner(req.body.first, req.body.last, req.body.signature)
//     .then()
//     .catch()
