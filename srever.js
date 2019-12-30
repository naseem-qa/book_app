'use strict';

require('dotenv').config();

const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');

const PORT = process.env.PORT;
const app = express();

app.use(cors());

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// app.get('/',getBooks);
app.get('/searches', renderForm);
app.post('/searches', findBook);

function renderForm(req, res) {
    res.render('pages/index');

}

function findBook(req, res) {
    let url = `https://www.googleapis.com/books/v1/volumes?q=in`
    if (req.body.search === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search}:${req.body.keyword}`
    } else if (req.body.search === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search}:${req.body.keyword}`
    }
    return superagent.get(url)
        .then(data => {
            let books = data.body.items.map((el) => {
                return new Book(el)
            })
            res.render('pages/searches/show', { books: books })
        });
}

function Book(data) {
    this.authors = (data.volumeInfo.authors && data.volumeInfo.authors[0]) || ' ';
    this.title = data.volumeInfo.title;
    this.ISBN = (data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].identifier) || ' ';
    this.description = data.volumeInfo.description;
    this.image = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) || ' ';
}

app.listen(PORT, () =>
    console.log(`app listen to PORT ${PORT}`));
