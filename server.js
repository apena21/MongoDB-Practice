var cheerio = require("cheerio");
var request = require("request");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var express = require("express");

// Require all models
var db = require("./models");

var PORT = 3000;

//Initialize Express
var app = express();

//Configure middleware

//Use morgan logger for logging requests
app.use(logger("dev"));
//Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true}));
//Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Connect to the Mongo DB
mongoose.connect("mongodb://localhost/MongoDB");

// Routes

// A GET route for scraping the NY Times website
app.get("/scrape", function(req, res) {

  // First, tell the console what server.js is doing
  console.log("\n***********************************\n" +
  "Grabbing every thread name and link\n" +
  "from New York Times's Option page:" +
  "\n***********************************\n");

  // Making a request for New York Times option page. The page's HTML is passed as the callback's third argument
  request("https://www.nytimes.com/section/opinion", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("div.story-body").each(function(i, element) {
    //$("h2.headline").each(function(i, element) {

    // Save the text of the element in a "title" variable
    var headline = $(element).find("h2.headline").text().trim();

    // Save the text of the element in a "title" variable
    // var title = $(element).text().trim();

    // Save the summary of the element in a "summary" variable
    var summary = $(element).find("p.summary").text().trim();

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    var link = $(element).find("a").attr("href").trim();

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      index: i,
      headline: headline,   
      //title: title,
      summary: summary,
      link: link
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
  
    // Create a new Article using the `result` object built from scraping
    // create for loop

    for (var i=0; i<results.length; i++){
      db.Article.create(results[i])
      .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      //  return res.json(err);
      console.log(err)
    });  
  }
});

  // If we were able to successfully scrape and save an Article, send a message to the client
  res.send("Scrape Complete");
  });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Find all articles
  db.Article.find({})
  .then(function(data){
  // If all Articles are successfully found, send them back to the client
  res.json(data);
  })
  .catch(function(err) {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});
  
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
//route to find one article using the req.params.id,
  // run the populate method with "note",
  // then respond with the article with the note included
db.Article.findOne({
  _id: req.params._id}).then(function(data) {

  }).then(function(data){
    res.json(data);
  }).catch(function(err) {
    res.json(err);
  });
});
  
  // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
  .then(function(newNote) {
  db.Article.findOneAndUpdate({
    _id: req.params._id
  },
  {
    note: newNote._id
  },
{
  new: true
});
  })
  .then(function(data){
    res.json(data);
  })
   .catch(function(err) {
    res.json(err);
  });
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});