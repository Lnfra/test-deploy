const express = require("express");
const router = express.Router();
const { books: oldBooks } = require("../data/db.json");
const { Book, Author } = require("../models");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

router
  .route("/")
  .get(async (req, res) => {
    const { author, title } = req.query;
    if (title) {
      const books = await Book.findAll({
        where: { title: title },
        include: [Author]
      });
      res.json(books);
    } else if (author) {
      const books = await Book.findAll({
        include: [{ model: Author, where: { name: author } }]
      });
      res.json(books);
    } else {
      const books = await Book.findAll({ include: [Author] });
      res.json(books);
    }
  })
  .post(verifyToken, async (req, res) => {
    const {title, author} = req.body;
    //if cannot find need to create
    const [foundAuthor] = await Author.findOrCreate({where: { name: author }})
    const newBook = await Book.create({title: title})
    await newBook.setAuthor(foundAuthor)
    const newBookWithAuthor = await Book.findOne({
      where: { id: newBook.id },
      include: [Author]
    });
    res.status(201).json(newBookWithAuthor);
  });

router
  .route("/:id")
  .put((req, res) => {
    const book = oldBooks.find(b => b.id === req.params.id);
    if (book) {
      res.status(202).json(req.body);
    } else {
      res.sendStatus(400);
    }
  })
  .delete((req, res) => {
    const book = oldBooks.find(b => b.id === req.params.id);
    if (book) {
      res.sendStatus(202);
    } else {
      res.sendStatus(400);
    }
  });

module.exports = router;
