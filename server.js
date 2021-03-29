// This to load the variablies from (.env) file
require('dotenv').config();



// This to load the dependancioes for the APP
const express = require("express");
const cors = require("cors");
const { request } = require('express');
const superagent = require('superagent');

// Set-up 
const PORT = process.env.PORT
const app = express();
const Geo_Key = process.env.Geo_Key
const weather_API_Key = process.env.weather_Key
const NPS_Key = process.env.NPS_Key
app.use(cors());



// This is the Routes to find the files and get data from them 
app.get('/location', getLocation);
app.get('/weather', takeWeather);
app.use('*', handleError);


// Functions to request and response 
function takeWeather(request, response) {
    // these two lines must be accourding to the Query string parameter in the console (NETWORK)
    const selectedLat = request.query.latitude;
    const selectedLon = request.query.longitude;

    const weatherQuery = {
        key: weather_API_Key,
        lat: selectedLat,
        lon: selectedLon,
        days: 8
    }

    const url = `http://api.weatherbit.io/v2.0/forecast/daily`

    superagent.get(url).query(weatherQuery).then(allData => {

        let array = allData.body.data.map(eachDay => {
            return new WeatherDataToFit(eachDay)
        })

        response.send(array)

    }).catch((error) => {
        response.status(500).send("something went wrong")
    })

}


// ---------------------------

function getLocation(request, response) {
    const selected = request.query.city
    const geoQuery = {
        key: Geo_Key,
        city: selected,
        format: 'json'
    }

    const url = `https://eu1.locationiq.com/v1/search.php`


    if (!selected) {
        response.status(404).send("City not found")
    }

    superagent.get(url).query(geoQuery).then(data => {

        const eachLocation = new LocationDataToFit(data.body[0], selected)
        response.send(eachLocation);
    })

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