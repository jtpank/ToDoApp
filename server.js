//npm install nodemon (local install)
//for auto refresh
//$ nodemon filename (global command)
//leverage package.json to run nodemon locally
//add new script
//then run
//$ npm run 'name'
//#include
// sanitize-html package for insurance on db (no js attacks)
let express = require("express")

let sanitizeHTML = require("sanitize-html")

//npm install mongodb --save (locally in .json)
let mongodb = require("mongodb")
//call express
let todoApp = express()

//what does this line do?
//A: tells app to access static (css, images, ...) files in the 'public' library
todoApp.use(express.static('public'))

//declare a variable with this name in global scope
let db
//for heroku port
let port = process.env.PORT
if(port == null || port == "")
{
  port = 8000
}
//connect to database
let connectionString = 'INPUT_DB_STRING'
mongodb.connect(connectionString, {useUnifiedTopology: true}, function(err, client) {
    db = client.db()
    //set port to listen AFTER connected to db
    todoApp.listen(port)
})

//tells express to automatically take form data 
todoApp.use(express.urlencoded({extended: false}))
//tells express to take asynchronous requests
todoApp.use(express.json())

//---------------------
//Other variables
let passwordSTR = "abc123"

//setup pw protection as well
function passwordProtect(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="To Do App"')
  if(req.headers.authorization == "Basic YWRtaW46cHczMjE="){
    next()
  } else {
    res.status(401).send("need password")
  }
  //next parameter, in express library, can do app.get or app.post, with args: (url, function(req, res, optional...))
  //Can also provide MULTIPLE functions
  //next goes to the next function
}

//add function to all routes as First function
todoApp.use(passwordProtect)


//using anonymous functions for CRUD
//read items (get splash page)
todoApp.get('/', function(req, res) {
    db.collection('items').find().toArray(function(err, items) {
        //access to all db items in code here:
        res.send(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple To-Do List</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        
        <body>
            <div class="container">
                <h1 id="headerA" class="display-4 text-center py-1"></h1>
                
                <div class="jumbotron p-3 shadow-sm">
                  <form id="create-form" action="/new-item" method="POST">
                    <div class="d-flex align-items-center">
                      <input id="create-field" autofocus autocomplete="off" name="stringToDo"class="form-control mr-3" type="text" style="flex: 1;">
                      <button class="btn btn-primary">Add New Item</button>
                    </div>
                  </form>
                </div>
                
                <ul id="item-list" class="list-group pb-5">
                  
                </ul>
                
              </div>

              <script>
                  //sending data back and forth with JSON
                  //converts to string of text
                  //server is sending raw data to our client
                  let items = ${JSON.stringify(items)}
                  
              </script>
              <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
              <script src="/browser.js"></script>
        </body>
        
        
        </html>`)
    })
    //res.sendFile('views/splash.html', {root: __dirname})
})

//create item
todoApp.post('/new-item', function(req, res) {
    //access db collection(name) then can perform CRUD operations
    let sanitizedText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
    db.collection('items').insertOne({text: sanitizedText}, function(err, info) {
        //wait (5 ms or 50 s or etc...) until the item is inserted in db
        //json = javascript object notation
        res.json(info.ops[0])
    })
    
})

//update item
todoApp.post('/update-item', function(req, res) {
  let sanitizedText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)},{$set: {text: sanitizedText}}, function() {
    res.send("success")
  })
  //db is updated now BUT NOT User Interface
})

//delete item
todoApp.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectID(req.body.id)}, function() {
    res.send("delete successful")
  })
})


