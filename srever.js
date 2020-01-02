'use strict';

// Environment Variables
require('dotenv').config();

// Application Dependencies
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const methodOverride = require('method-override');

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

//Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors());

//Application Middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  
// API routes
app.get('/', getBooks);
app.get('/searches', renderForm);
app.post('/searches', findBook);
app.post('/add', savedbook);
app.get('/add', getBooks);
app.post('/select', selectedBook);
// app.put('/update/:id',updateSaved);
// app.post('/updatebook/:id',getUpdateForm)


function renderForm(req, res) {
    res.render('pages/searches/new');
}

function Book(data) {
    this.authors = (data.volumeInfo.authors && data.volumeInfo.authors[0]) || ' ';
    this.title = data.volumeInfo.title;
    this.ISBN = (data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].identifier) || ' ';
    this.description = data.volumeInfo.description;
    this.image = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) || ' ';
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
            res.render('pages/searches/show', { searchResults: books })
        });
}

function selectedBook(req, res) {
    let { title, authors, image, ISBN, description } = req.body;
    res.render('pages/searches/select', { book: req.body })
}
     
function savedbook(req, res) {
    let { title, authors, image, ISBN, description } = req.body;
    let SQL = 'INSERT INTO booksjo(title, authors, image, ISBN, description) VALUES ($1, $2, $3, $4, $5);'
    let values = [title, authors, image, ISBN, description];
    client.query(SQL, values)
        .then(() => {
            getBooks(req, res)
        })
}


function getBooks(req, res) {
    let SQL = `SELECT * FROM booksjo;`;
    client.query(SQL)
        .then(results => {
            res.render('pages/searches/add', { searchResults: results.rows });
            console.log(results.rows);
            
        })
}

function updateSaved(req,res){
    let { title, authors, image, ISBN, description } = req.body;
    let SQL = `UPDATE booksjo SET title=$1, authors=$2, image=$3, ISBN=$4, description=$5 WHERE id=$6 `
    let values = [title, authors, ISBN, image, description, req.params.book_id];
    client.query(SQL,values)
    .then(res.redirect('/add'))
}

function getUpdateForm (req,res){
    let { title, authors, image, ISBN, description } = req.body;
res.render('pages/update1',{book: req.body});
}

client.connect()
    .then(
        app.listen(PORT, () => console.log(`app listen to ${PORT}`)));

