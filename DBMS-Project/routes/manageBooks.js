const express = require('express');
const router = express.Router();
const {getBooks,editBook,deleteBook,insertBook} = require('../database')
router.get("/manageBooks", async (req, res) => {
    const books = await getBooks();
    const data = JSON.parse(books);
    res.render("manageBooks", { data });
  
});

router.post("/manageBooks/addBook", async (req, res) => {
    try {
      const bookName = req.body.name;
      const genre = req.body.genre;
      const isbn = req.body.isbn;
      const publicationYear = req.body.publicationYear;
      const avalCopies = req.body.availableCopies;
      const totalCopies = req.body.totalCopies;
  
      const result = await insertBook(bookName,isbn, genre,publicationYear,avalCopies,totalCopies);
      // console.log('Book added successfully:', result);
    } catch (err) {
      console.error("Error adding book:", err);
    }
  
    res.redirect("/manageBooks");
  });
  
  router.post("/manageBooks/deleteBookPost", async (req, res) => {
    try {
      const bookIdToDelete = req.body.bookId; // Assuming your button has name="deleteBookBtn"
      const result = await deleteBook(bookIdToDelete);
      console.log("Book deleted successfully:", result);
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  
    res.redirect("/manageBooks");
  });
  
  router.post("/manageBooks/editBookPost", async (req, res) => {
    try {
      const bookIdToEdit = req.body.bookId;
      console.log(bookIdToEdit)
      const updatedBookName = req.body.updateName;
      const updatedBookGenre= req.body.updateGenre;
      const updateBookIsbn= req.body.updateIsbn;
      const updateBookPubYear = req.body.updatePublicationYear;
      const updateBookAvalCopies = req.body.updateAvailableCopies;
      const updateBookTotCopies = req.body.updateTotalCopies;
      const result = await editBook(
        bookIdToEdit,
        updatedBookName,
        updateBookIsbn,
        updatedBookGenre,
        updateBookPubYear,
        updateBookAvalCopies,
        updateBookTotCopies
      );
      console.log(bookIdToEdit);
      console.log("Book edited successfully:", result);
    } catch (err) {
      console.error("Error editing book:", err);
    }
  
    res.redirect("/manageBooks");
  });
  

module.exports = router;

  