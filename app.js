// bodyParser can be used to get data from forms etc with the req 
var bodyParser = require("body-parser");
// to prevent weird inputs from users in forms
// needs to come after body-parser
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");
// initialize express
const express = require("express");
const app = express();

// configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(express.static("public"));
// if we don't want to call home.ejs but just home
app.set("view engine", "ejs");

// mongo database connection
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/portfolio");

// Schema setup
// this defines pattern for data
var projectSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    languages: String,
    url: String,
    github: String
});

// "Project" is the singular version of the collection name
var Project = mongoose.model("Project", projectSchema);

// landing page
app.get("/", function(req, res) {
    res.render("landing");
});

// RESTful routes
// INDEX
app.get("/projects", function(req, res) {
    Project.find({}, function(err, allProjects) {
        if (err) {
            console.log(err);
        } else {
            res.render("projects", {projects: allProjects});
        }
    });    
});

// NEW
app.get("/projects/new", function(req, res) {
    res.render("new");
});

// CREATE
app.post("/projects", function(req, res) {
    // remove potential script tags in description
    req.body.project.description = req.sanitize(req.body.project.description);
    // get data from form and add to projects database
    var newProject = req.body.project;
    Project.create(newProject, function(err, newlyCreatedProject) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/projects");
        }
    });
});

// SHOW
app.get("/projects/:id", function(req, res) {
    console.log(req.params.id);
    Project.findById(req.params.id, function(err, foundProject){
        if (err) {
            console.log(err);
        } else {
            // render show template with the project
            res.render("show", {project: foundProject});
        }
    });
});

// EDIT
app.get("/projects/:id/edit", function(req, res) {
    Project.findById(req.params.id, function(err, foundProject) {
        if (err) {
            res.redirect("/projects");
        } else {
            res.render("edit", {project: foundProject});
        }
    });    
});

// UPDATE - note that HTML forms do not include put requests --> method-override
app.put("/projects/:id", function(req, res) {
    // middleware can run this before
    req.body.project.description = req.sanitize(req.body.project.description);
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, updateProject) {
        if (err) {
            res.redirect("/projects");
        } else {
            res.redirect(`/projects/${req.params.id}`);
        }
    });
});

// DELETE
app.delete("/projects/:id", function(req, res) {
   // destroy project
   Project.findByIdAndRemove(req.params.id, function(err){
       if (err) {
           res.redirect("/projects");
       } else {
           res.redirect("/projects");
       }
   }); 
});

// redirect all other request
app.get("*", function(req, res) {
    res.redirect("/");
});

// listen for requests (start server)
const port = 3000;
// can take port and optional call back as well
app.listen(port, () => console.log(`Listening on port ${port}.`));