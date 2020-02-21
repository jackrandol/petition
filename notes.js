part 2:

once the petition is signed, user directed to petition/signed and they see their own
signature

tamper proof cookies

cookie security:


set x-frame-options: deny
this is to prevent people from using your site in an iframe somewhere else to deceive
people


///for password we need to see if they entered anything or not and update or not UPDATE
update Query
//here column name = value is the syntax
UPDATE actors SET first ='Brad', last='Pitt'
WHERE first = 'Lenoardo' AND last = 'Dicaprio'

// if they type the password, then do a hash and new querySelector
//lots of branching using queries
//user req.session.userId to know which row to update

//we want to update a row if it exists or we want to insert a row if it doesn't EXISTS
//UPSERT!

INSERT INTO actors (first, last, user_id)
VALUES ('BRAD', 'PITT', 'bradp@aol.com')
ON CONFLICT (user_id) DO
ON actors SET first = 'Brad', last = 'Pitt'

//the conflict here refers to the unique value which would cause a conflict because the query would
//join them on the user_id

//if the update is successful, you can render a page to say changes were saved, show new values,
//do the two queries and put them in an array and pass them to promise.all

db.query(
    INSERT INTO whatever (some_number) VALUES $1
    [value || null, first_name || null etc ]
)

//to logout

app.get('/logout', (req, res) {
    req.session = null;
    res.redirect('/login');
});

//deleting signature
//it's not a link, its a delete request, which needs to be a post request
//action is the url that the post goes to, since we're on the petition page, if whil
//left this out then the post request would automatically go to the petition page

//this means that if you're storing the sigId in session, you have to delete that session
//before they move on so that the routing works correctly.
req.session.signatureId = null;


<form method="POST" action = "/signature/delete">
<input type='hidden' name="_csrf" value='{{csrfToken}}'>
<button> delete sig</button>
</form>
//this post triggers a db.query to delete the signature and then get redirected maybe to petition

//deleting, we can only delete an entire row
DELETE FROM actors WHERE last = 'Pitt'


///////supertest///////

app.get('/welcome', (req, res) => {
    res.send('<h1>HIIIII</h1>');
});

app.post('/welcome', (req, res) => {
    req.session.submitted = true;
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    if (!req.session.submitted) {
        return res.redirect('/welcome')
    }
    res.send("<h1>home</h1>");
});

// ./src/redis-server to start redis server
// ./_profile

//we use daemonize on redis to keep it running in the background at all times  
