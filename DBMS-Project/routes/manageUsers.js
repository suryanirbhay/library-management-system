const express = require('express');
const { getUsers ,deleteUser , addUser, editUser} = require('../database');
const router = express.Router();
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');


router.get("/manageUsers", async(req, res) => {
    const data = await getUsers();
    // const data = JSON.parse(users);
    console.log(data);
    res.render("manageUsers" ,{data});
  });

router.post("/manageUsers/deleteUserPost",async(req,res)=>{
  try{
  const usn =  req.body.usn;
  const data = await deleteUser(usn);
  console.log(data);
  }
  catch(err){
    console.log("The error is ",err);
  }
  res.redirect("/manageUsers");
})


router.post("/manageUsers/addUser", async(req,res)=>{
  try{
    const fname = req.body.fname;
    const lname = req.body.lname;
    const usn = req.body.usn;
    const email = req.body.email;
    const pnumber = req.body.pnumber;
    const address = req.body.address;
    const pass = req.body.pass;

    const result = await addUser(usn,fname,lname,email,pnumber,address,pass)
    console.log(result);
  }
  catch(err){
    console.log(err);
  }
  finally{
    res.redirect("/manageUsers")
  }
})

router.post("/manageUsers/editUserPost",async(req,res)=>{
  try{
    const fname = req.body.fname;
    const lname = req.body.lname;
    const usn = req.body.usn;
    const email = req.body.email;
    const pnumber = req.body.pnumber;
    const address = req.body.address;
    const pass = req.body.pass;
    const res = await editUser(fname,lname,email,pnumber,address,usn,pass);
    console.log(res);
  }
  catch(err){
    console.log(err);
  }
  finally{
    res.redirect("/manageUsers");
  }
})


router.post("/manageUsers/generatePdf",async(req,res)=>{

  
  const templatePath = 'D:\\DBMS Project\\views\\template.ejs'
  const imagePath = path.join(__dirname, '..', 'public', 'images', '8380015.png');
  
    const imageData = fs.readFileSync(imagePath, 'base64');
  // const templatePath = path.join(__dirname, 'views', 'your-template.ejs'); // Replace 'your-template.ejs' with the actual filename
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  const data = {
    fname: req.body.fname,
    lname : req.body.lname,
    email : req.body.email,
    pnumber : req.body.pnumber,
    address : req.body.address,
    imageData: imageData,
  }
  // Render EJS template
  const html = ejs.render(templateContent, data);

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the HTML content on the page
  await page.setContent(html);

  // Generate PDF
  await page.pdf({ path: 'output.pdf', format: 'A4' });

  // Close the browser
  await browser.close();

  console.log('PDF generated successfully!');
  res.redirect("/manageUsers")
})

module.exports = router;