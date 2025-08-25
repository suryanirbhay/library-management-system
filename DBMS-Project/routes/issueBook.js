const express = require('express');
const router = express.Router();
const {getBooks, issueBook} = require('../database')

router.get("/issueBook", async (req, res) => {
    const books = await getBooks();
    const data = JSON.parse(books);
    res.render("issueBook", { data });
  
});
router.post("/issueBook/issue",async(req,res)=>{
    try{

        const usn = req.body.usn;
        const bid = req.body.bookId;
        const result  = await issueBook(usn,bid);
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
    res.redirect("/issueBook")
})


module.exports = router;


