const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;  

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// // Get the book list available in the shop
// public_users.get('/', async (req, res) => {
//   res.send(JSON.stringify(books)); 
// });

public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("No books found.");
        }
      });
    };

    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve books." });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = books[isbn]; //isbn is the index of the book 

    const getBooks = () => {
      return new Promise((resolve, reject)=> {
        if (book){
          resolve(book)
          } else {
          reject("No books found.")
          }
        });
    }
    const allBooks = await getBooks();
    return res.status(200).json(book);
    } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve books." });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      const matchedBooks = [];
      for (let isbn in books){
        const book = books[isbn];
        if (book.author.toLowerCase() === author.toLowerCase()){
          matchedBooks.push({isbn, ...book})
          }
      }

      if (matchedBooks.length > 0){
        resolve(matchedBooks);
      } else {
        reject("No book found" );
      } 
    })
  }

  try {
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch(error){
    return res.status(404).json({ message: "Failed to retrieve books" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      const matchedBooks = [];
      for (let isbn in books){
        const book = books[isbn];
        if (book.title.toLowerCase() === title.toLowerCase()){
            matchedBooks.push({isbn, ...book})
          }
        }
        if (matchedBooks.length > 0){
          resolve(matchedBooks); 
        } else {
          reject("No book found" );
        }
    })
  }

  try {
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error){
    return res.status(404).json({ message: "Failed to retrieve books" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]; 

  if (book){
    const reviews = book.reviews;
    res.status(200).send(JSON.stringify(reviews)); 
  } else {
    return res.status(404).json({ message: "No book found" });
  }
});

module.exports.general = public_users;
