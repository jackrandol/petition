DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL CHECK (first != ''),
      last VARCHAR(255) NOT NULL CHECK (last != ''),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );



-- INSERT INTO signatures (first, last, signature) VALUES ('jack', 'randol', 'sig');

-- CREATE TABLE signatures (
--     id SERIAL PRIMARY KEY,
--     first VARCHAR NOT NULL CHECK (first != ''),
--     last VARCHAR NOT NULL (last != ''),
--     signature VARCHAR NOT NULL (sig != '')
-- );
