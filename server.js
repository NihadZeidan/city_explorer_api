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
app.get('/location', getLocation);
app.get('/', () => console.log("WELCOME!"));
app.get('/weather', getWeather);
app.use('*', error);


function getWeather(request, response) {
    const searchQuery = request.query;

    const weatherData = require("./data/weather.json");
    const eachWeather = new WeatherDataToFit(weatherData.data[0]);

    response.send(eachWeather);
}

function getLocation(request, response) {
    const searchQuery = request.query;

    const locationData = require('./data/location.json')
    const eachLocation = new LocationDataToFit(locationData[0])
    response.send(eachLocation);

}

function error(request, response) {

    const searchQuery = request.query;
    const obj = {
        status: 500,
        responseText: "Sorry, something went wrong",
    }
    response.send(obj)
}



//  Constractor functions to fit the data with the frontEnd
function LocationDataToFit(data) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
    this.search_query = data.type
}

function WeatherDataToFit(day) {
    this.forecast = day.weather.description
    this.time = day.datetime
}




//  This to Listen to your port when your run it !
app.listen(PORT, () => console.log(PORT));