DROP TABLE IF EXISTS booksjo;
CREATE TABLE booksjo
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    image VARCHAR(255),
    isbn VARCHAR(255),
    description text,
    bookshelf VARCHAR(255)
);
