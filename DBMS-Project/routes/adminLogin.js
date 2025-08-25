const express = require('express');
const router = express.Router();
const {isValidAdminLogin} = require("../database");
const axios = require("axios");
const request = require("request");


function getDate() {
    const currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = currentDate.getDate();
    const monthIndex = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;
    return formattedDate;
  }

  var category = "education";
  var qte = "";
  
  request.get(
    {
      url: "https://api.api-ninjas.com/v1/quotes?category=" + category,
      headers: {
        "X-Api-Key": "f/LlTnZI+FEVME3A7ZYOrw==5kEIq27BSh3vYdxx",
      },
    },
    function (error, response, body) {
      if (error) return console.error("Request failed:", error);
      else if (response.statusCode != 200)
        return console.error(
          "Error:",
          response.statusCode,
          body.toString("utf8")
        );
      else {
        const quoteData = JSON.parse(body);
        qte = quoteData[0].quote;
      }
    }
  );
  

router.get("/adminLogin", (req, res) => {
    res.render("adminLogin",{messages : req.flash()});
  });
 
  

  
router.post("/adminLogin", async(req, res) => {
    var adminEmid = req.body.adminEmail;
    var adminPswd = req.body.adminPassword;
    // console.log(adminEid, adminPass);
    newDate = getDate();
    var currentTemp = 0;
  
    const params = {
      access_key: "b2398b53f57af9011cb600d96c656e9a",
      query: "bengaluru",
    };
  
    axios
      .get("http://api.weatherstack.com/current", { params })
      .then((response) => {
        const apiResponse = response.data;
        currentTemp = apiResponse.current.temperature;
      })
      .catch((error) => {
        console.log(error);
      });
  
    const result = await isValidAdminLogin(adminEmid,adminPswd);
    if (result == -2) {
      req.flash("error", "Wrong Password");
      return res.redirect("/adminLogin");
  
    } 
    else if (result == 0) {
      req.flash("success", "Form submitted successfully");
      res.render("adminDashboard",{ date:newDate,newquote:qte,newTemp : currentTemp});
  
    }
     else if (result == -1) {
      req.flash("error", "User not Found");
      return res.redirect("/adminLogin");
    }
  
  });



module.exports = router;