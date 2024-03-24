//express server
const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
//variables
const pathName = __dirname + "/public";
const port = 3000;
let connection = mysql.createConnection({
  host: "localhost",
  user: "grocery_user",
  password: "Root@123",
  database: "grocery_db",
});
const fifteenMin = 1000 * 60 * 15;

app.use(express.static(pathName));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "fhrgfgrfrty84fwir767secretkey",
    saveUninitialized: true,
    cookie: { maxAge: fifteenMin, sameSite: "strict" },
    resave: false,
  })
);

//loads home page
app.get("/", (request, response) => {
  response.sendFile(pathName + "/web.html");
});

//loads products page
app.get("/products", (request, response) => {
  response.sendFile(pathName + "/products.html");
});

app.post("/products", (request, response) => {
  let query =
    "SELECT * FROM groceries WHERE grocery_type='" + request.body.type + "'";
  connection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.send(results);
    }
  });
});

//opens creat account page
app.get("/create", (request, response) => {
  response.sendFile(pathName + "/create_account.html");
});

//creates new user
app.post("/create", (request, response) => {
  let query =
    "INSERT INTO users (username, password) VALUES('" +
    request.body.email +
    "', '" +
    request.body.password +
    "')";
  connection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      response.redirect("/");
    }
  });
});

//checks if user is signed in
app.get("/login", (request, response) => {
  if (request.session.loggedIn) {
    response.json({ loggedIn: request.session.loggedIn });
  } else {
    response.json({ loggedIn: false });
  }
});

//login
app.post("/login", (request, response) => {
  console.log("body:" + JSON.stringify(request.body));
  let query =
    "SELECT COUNT(*) AS count FROM users WHERE username='" +
    request.body.email +
    "' AND password='" +
    request.body.password +
    "'";
  connection.query(query, (err, results, fields) => {
    if (err) {
      console.log(err);
    } else {
      let count = results[0].count;
      if (count) {
        request.session.loggedIn = true;
      } else {
        console.log("wrong username or password combination");
        request.session.loggedIn = false;
      }
      response.redirect("/");
    }
  });
});

//signs out user
app.get("/signout", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

app.listen(port, () => {
  console.log("application started");
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else console.log("db connected");
});
