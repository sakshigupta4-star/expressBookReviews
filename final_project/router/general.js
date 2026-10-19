const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this server, so Axios can call it
const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Raw data endpoint that the Axios calls below fetch from
public_users.get('/books-data', (req, res) => {
  return res.status(200).json(books);
});

// Get the book list available in the shop (async/await with Axios)
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${getBaseUrl(req)}/books-data`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN (async/await with Axios)
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${getBaseUrl(req)}/books-data`);
    const book = response.data[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by ISBN" });
  }
});

// Get book details based on author (async/await with Axios)
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const response = await axios.get(`${getBaseUrl(req)}/books-data`);
    const result = {};
    Object.keys(response.data).forEach((key) => {
      if (response.data[key].author.toLowerCase() === author) {
        result[key] = response.data[key];
      }
    });
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title (async/await with Axios)
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get(`${getBaseUrl(req)}/books-data`);
    const result = {};
    Object.keys(response.data).forEach((key) => {
      if (response.data[key].title.toLowerCase() === title) {
        result[key] = response.data[key];
      }
    });
    return res.status(200).send(JSON.stringify(result, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${getBaseUrl(req)}/books-data`);
    const book = response.data[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book review" });
  }
});

module.exports.general = public_users;
