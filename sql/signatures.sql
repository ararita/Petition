
DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures
(
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature <> ''),
    user_id INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
