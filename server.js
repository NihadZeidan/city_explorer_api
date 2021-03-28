// This to load the variablies from (.env) file
require('dotenv').config();



// This to load the dependancioes for the APP

const express = require("express");
const cors = require("cors");


// Set-up 

const PORT = process.env.PORT
const app = express();
app.use(cors());