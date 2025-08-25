const express = require("express");
const router = express.Router();
const { isValidStudentLogin, showUserTransaction ,returnBook} = require("../database");

router.get("/", (req, res) => {
  res.render("studentLogin", { messages: req.flash() });
});

router.post("/studentLogin", async (req, res) => {
  const studentEid = req.body.studentEmail;
  const studentPass = req.body.studentPassword;
  const ress = await isValidStudentLogin(studentEid, studentPass);

  if (ress == -2) {
    req.flash("error", "wrong Password");
    return res.redirect("/");
  } else if (ress == 0) {
    
    try {
      const op = await showUserTransaction(studentEid);
      const data = JSON.parse(op);
      console.log(data);

      if(data.length > 0){

        req.flash("success", "Form submitted successfully");
        res.render("studentDashboard", { data });
      }
      else{
        let data = [
          {
            transaction_id: 'NULL',
            usn: "NULL",
            first_name: "NULL",
            last_name: "NULL",
            email: "NULL@gmail.com",
            phone_number: "N/A",
            book_name: "N/A",
            transaction_date: "N/A",
            due_date: "N/A",
            return_date: null,
            fine_amount: "N/A",
          },
        ];
        res.render("studentDashboard", { data });
      }
    } catch (err) {
      // console.log(err);
    }
  } else if (ress == -1) {
    req.flash("error", "User not found");
    return res.redirect("/");
  }
});

router.post("/studentDashboard/returnBook",async(req,res)=>{
  try{

    const tid = req.body.tid;
    const result = await returnBook(tid);
    console.log(result);
   
  }
  catch(err)
  {
    console.log(err);
    
  }
 
})

module.exports = router;
