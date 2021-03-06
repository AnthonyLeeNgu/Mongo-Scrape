// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var cheerio = require("cheerio");

var app = express();

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

app.use(logger("dev"));

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static("public"));

// Database configuration
var databaseUrl = "scraper";
var collections = ["savedArticles", "articleNotes"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Routes
// ======

app.get("/", function(req, res) {
  res.send(index.html);
});

// Handle form submission, save submission to mongo
app.post("/save", function(req, res) {
  console.log(req.body);
  // Insert the note into the notes collection
  db.savedArticles.insert(req.body, function(error, saved) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      res.send(saved);
    }
  });
});

app.get("/scrape", function(req, res) {
  request("https://www.theonion.com/", function(error, response, html) {
    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    $(".js_entry-title").each(function(i, element) {
      // console.log($(element).children();
      var link = $(element)
        .children()
        .attr("href");
      var title = $(element)
        .children()
        .text();

      // // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        title: title,
        link: link
      });
    });
    res.send(results);
  });
});
app.get("/find", function(req, res) {
  db.savedArticles.find(function(error, found) {
    // log any errors
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      console.log(found);
      res.send(found);
    }
  });
});
app.get("/find/:id", function(req, res) {
  db.articleNotes.find(
    {
      articleid: req.params.id
    },
    function(error, found) {
      // log any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the note to the browser
        // This will fire off the success function of the ajax request
        console.log(found);
        res.send(found);
      }
    }
  );
});
// Update just one note by an id
app.post("/addNote", function(req, res) {
  // When searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IdYouWantToFind))

  // Update the note that matches the object id
  console.log(req.body);
  // Insert the note into the notes collection
  db.articleNotes.insert(req.body, function(error, saved) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
      // Otherwise, send the note back to the browser
      // This will fire off the success function of the ajax request
      res.send(saved);
      console.log(saved);
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

app.get("/delete/fave/:id", function(req, res) {
  // Remove a note using the objectID
  db.savedArticles.remove(
    {
      _id: mongojs.ObjectID(req.params.id)
    },
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(removed);
        res.send(removed);
      }
    }
  );
});

app.get("/delete/note/:id", function(req, res) {
  // Remove a note using the objectID
  db.articleNotes.remove(
    {
      _id: mongojs.ObjectID(req.params.id)
    },
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    }
  );
  mongoose.Promise = Promise;
  mongoose.connect(MONGODB_URI);
});
