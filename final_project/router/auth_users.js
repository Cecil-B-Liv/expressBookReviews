const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// {
//   "username": "newuser",
//   "password": "securepass"
// }

const isValid = (username)=>{ //returns boolean
  for (let user of users) {
    if (user.username === username) {
      return true;
    }
  }
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  for (let user of users) {
    if (user.username === username && user.password === password) {
        return true;
      }
    }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
    
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)){
    const accessToken  = jwt.sign({username}, "access", {expiresIn:'1h'});
    
    req.session.authorization = {
      accessToken, username
    }

  return res.status(200).json({ message: "Login successful." });
  } else {
  return res.status(401).json({ message: "Invalid username or password."});
  }
});

// {
//   "review": "Very moving and insightful."
// }
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username){
    return res.status(401).json({message: "User not logged in."})
  }
  if (!review) {
    return res.status(400).json({ message: "Review query is required." });
  }

  if (books[isbn]) {
    if (!books[isbn].reviews) books[isbn].reviews = {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully." });
      } else {
    return res.status(404).json({ message: "Book not found." });
  }
  
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username){
    return res.status(401).json({message: "User not logged in."})
  }

  if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found." });
  } 
  
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Delete review successfully."});
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
