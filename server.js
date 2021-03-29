// This to load the variablies from (.env) file
require('dotenv').config();



// This to load the dependancioes for the APP
const express = require("express");
const cors = require("cors");
const { request } = require('express');


// Set-up 
const PORT = process.env.PORT
const app = express();
app.use(cors());



// This is the Routes to find the files and get data from them 
app.get('/location', getLocation);
// app.get('/', () => console.log("WELCOME!"));
app.get('/weather', getWeather);
app.use('*', handleError);


// Functions to request and response 
function getWeather(request, response) {
    const searchQuery = request.query;
    let arr = [];

    try {

        const weatherData = require("./data/weather.json");
        weatherData.data.forEach(item => {
            const eachWeather = new WeatherDataToFit(item);
            arr.push(eachWeather);
        })

        response.send(arr);
    } catch (error) {
        response.status(404).send("something wrong")
    }

}


function getLocation(request, response) {
    const selected = request.query.city
        // we can put also  ===> searchQuery.city


    if (!selected) {
        response.status(404).send("City not found")
    }

    const locationData = require('./data/location.json')
    const eachLocation = new LocationDataToFit(locationData[0], selected)
    response.send(eachLocation);

}

function handleError(request, response) {
    const status = 500;
    const responseText = "Sorry, something went wrong";
    response.status(status).send(responseText)
}



//  Constractor functions to fit the data with the frontEnd
function LocationDataToFit(data, searchQuery) {
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
    this.search_query = searchQuery;
}

function WeatherDataToFit(day) {
    this.forecast = day.weather.description;
    this.time = day.datetime;

}


//  This to Listen to your port when your run it !
app.listen(PORT, () => console.log(PORT));