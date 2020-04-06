///index.test.js
const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("cookie-session");

test('GET /petition redirects logged out user to /register', () => {
    return supertest(app).get('/petition').then(res => {
        expect(res.text).toBe('Found. Redirecting to /register');
    });
});

test('GET /register redirects logged in users to /petition', () => {
    const cookie = {};
    cookieSession.mockSessionOnce(cookie);
    return supertest(app).get('/register').then(res => {
    });
});
