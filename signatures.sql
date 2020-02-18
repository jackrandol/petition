DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users CASCADE ;
DROP TABLE IF EXISTS userProfiles;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL CHECK (first != ''),
      last VARCHAR(255) NOT NULL CHECK (last != ''),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );


CREATE TABLE userProfiles(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(255),
    url VARCHAR(255),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- the references can be annoying here because of referential integrity

-- to deal with capitalization of cities you can use this line
-- WHERE LOWER(city) =  LOWER($1);

-- INSERT INTO signatures (first, last, signature) VALUES ('jack', 'randol', 'sig');

-- CREATE TABLE signatures (
--     id SERIAL PRIMARY KEY,
--     first VARCHAR NOT NULL CHECK (first != ''),
--     last VARCHAR NOT NULL (last != ''),
--     signature VARCHAR NOT NULL (sig != '')
-- );
