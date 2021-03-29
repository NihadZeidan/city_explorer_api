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
const weather_Key = process.env.weather_Key
const NPS_Key = process.env.NPS_Key
app.use(cors());




// This is the Routes to find the files and get data from them 

app.get('/location', getLocation);
// app.get('/', () => console.log("WELCOME!"));
app.get('/weather', getWeather);
app.use('*', handleError);


// Functions to request and response 
function getWeather(request, response) {
    // const searchQuery = request.query;
    // const weatherQuery = {
    //     key: weather_Key
    // }
    const url = `https://api.weatherbit.io/v2.0/current${weather_Key}`



    // const weatherData = require("./data/weather.json");
    superagent.get(url).then(allData => {
        const eachWeather = new WeatherDataToFit(allData);
        response.send(eachWeather);

    }).catch((error) => {
        response.status(500).send("something went wrong")
    })

}
// weatherData.data.map(item => {
//     arr.push(eachWeather);
// })
// }


// ---------------------------

function getLocation(request, response) {
    const selected = request.query.city
        // we can put also  ===> searchQuery.city
    const geoQuery = {
        key: Geo_Key,
        city: selected,
        format: 'json'
    }

    const url = `https://eu1.locationiq.com/v1/search.php`


    if (!selected) {
        response.status(404).send("City not found")
    }


    // const locationData = require('./data/location.json')
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
    this.lat = day.lat;
    this.lon = day.lon;

}


//  This to Listen to your port when your run it !
app.listen(PORT, () => console.log(PORT));