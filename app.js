const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/userRoute");
const session = require("express-session");
const autenticacion = require("./middleware/auth");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "mi_secreto",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/home", autenticacion, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
})

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});