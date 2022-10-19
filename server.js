const express = require("express");
const cors = require("cors");
// const dbConfig = require("./app/config/db.config");
const seeder = require ("./app/seeders");
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path')
var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Use the express-fileupload middleware
app.use(fileUpload());
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')))

// call Seeder 
seeder();

// call Routes
require("./app/routes/routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
