// This to load the variablies from (.env) file
require('dotenv').config();



// This to load the dependancioes for the APP
const express = require("express");
const cors = require("cors");


// Set-up 
const PORT = process.env.PORT
const app = express();
app.use(cors());


// This is the Routes to find the files and get data from them 
app.get('/location', getLocation)

function getLocation(request, response) {
    const searchQuery = request.query;

    const locationData = require('./data/location.json')
    const eachLocation = new LocationDataToFit(locationData)

    response.send(eachLocation);
}

function LocationDataToFit(data) {
    this.formatted_query = data.display_name;
    this.search_query = data.type
    this.latitude = data.lat;
    this.longitude = data.lon;
}