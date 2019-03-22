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
    const { title, author } = req.body;
    const foundAuthor = await Author.findOne({ where: {name : author} });

    if (!foundAuthor) {
      const createdBook = await Book.create(
        { title, author: { name: author } },
        { include: [Author] }
      );
      return res.status(201).json(createdBook);
    }
    const createdBook = await Book.create(
      { title, authorId: foundAuthor.id },
      { include: [Author] }
    );
    return res.status(201).json(createdBook);
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
