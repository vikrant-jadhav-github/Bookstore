const { createBook, getBookById, getSellerBooks, getBooksByQuery, getAllBooks, updateBook, deleteBook } = require("../controllers/bookController");
const book = require("../models/book");
const { uploadFile } = require("../utils/uploadFile");

require("dotenv").config();

const router = require("express").Router();

router.put("/update/:id", updateBook);

router.get("/", getAllBooks);
router.get("/sellerbooks/:sellerid", getSellerBooks);
router.get("/search", getBooksByQuery);
router.get("/:id", getBookById);

router.delete("/delete/:id", deleteBook);

router.post("/create", createBook);


module.exports = router