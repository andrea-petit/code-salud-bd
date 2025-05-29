const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require ("./database/db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));



app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});