///index.test.js
const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("cookie-session");

test('GET /petition redirects logged out user to /register', () => {
    return supertest(app).get('/petition').then(res => {
        // console.log("res:", res);
        expect(res.text).toBe('Found. Redirecting to /register');
    });
});

test('GET /register redirects logged in users to /petition', () => {
    const cookie = {};
    cookieSession.mockSessionOnce(cookie);

    return supertest(app).get('/register').then(res => {
        

    });
});


// test('POST /welcome sets req.session.submitted to true', ( ) => {
//     //if we want to check if the route is writing information, we give it an empty
//     //cookie and then the route will add the properties from index.js
//     const cookie = {};
//     cookieSession.mockSessionOnce(cookie);
//     return supertest(app).post('/welcome').then(res => {
//         console.log('cookie:', cookie);
//         expect(cookie.submitted).toBe(true);
//     });
// });

// test("POST /welcome sets req.session.submitted to true", () => {
//     const cookie = {};
//     cookieSession.mockSessionOnce(cookie);
//     return supertest(app)
//         .post("/welcome")
//         .then(res => {
//             console.log('cookie res', res);
//             expect(cookie.submitted).toBe(true);
//         });
// });

// test('GET /house sends a 200 status code response when there is a submitted cookie', () => {
//     cookieSession.mockSessionOnce({
//         //mocksessionONCE means the cookie will only exist during that test and
//         //not affect the rest of your tests
//         submitted: true,
//         dogs: 'cute',
//         age: 120932,
//         name: 'jack'
//         //this might need to be update to the actual thing i submitted with cookie sess from app.use in index.js
//     });
//     return supertest(app).get('/house').then(res => {
//         // console.log('res:', res);
//         expect(res.statusCode).toBe(200);
//         expect(res.text).toBe("<h1>house</h1>");
//     });
// });

// test('get /house sends 302 status code as response when no cookie', () => {
//     return supertest(app).get('/house').then(res => {
//         expect(res.statusCode).toBe(302);
//         expect(res.headers.location).toBe('/welcome');
//     });
// });

// test('get /welcome sends 200 status code as response', () => {
//     return supertest(app).get('/welcome').then(response => {
//
//         expect(response.statusCode).toBe(200);
//         // console.log(response.text);
//         expect(response.text).toBe('<h1>HIIIII</h1>');
//     });
// });
