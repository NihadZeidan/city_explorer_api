// This to load the variablies from (.env) file
require('dotenv').config();



// This to load the dependencies for the APP
const { request, response } = require("express");
const express = require("express");
const cors = require("cors");
const superagent = require('superagent');
const pg = require("pg");

// Set-up 
const PORT = process.env.PORT;
const app = express();
const Geo_Key = process.env.Geo_Key;
const weather_API_Key = process.env.weather_Key;
const park_API_Key = process.env.api_key;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
app.use(cors());
const DataBase_URL = process.env.DataBase_URL;
const yelp_key = process.env.yelp_key

// this to connect with the DB and avoid any errors like :(DeprecationWarning: Unhandled promise rejections are deprecated.)
const client = new pg.Client({
    connectionString: DataBase_URL,
    // ssl: {
    //     rejectUnauthorized: false
    // }
});


// This is the Routes to find the files and get data from them 
app.get('/location', getLocation);
app.get('/weather', takeWeather);
app.get('/parks', getParks);
app.get('/movies', getMovies);
app.get('/yelp', getRestaurants)
app.use('*', handleError);


// Functions to request and response 


function getRestaurants(request, response) {

    const { latitude, longitude, search_query } = request.query

    const searchQuery = {
        api_key: yelp_key,
        latitude: latitude,
        longitude: longitude,
        location: search_query,
        limit: 20,
        term: 'restaurants',
        // format: "json"
    }

    const yelp_url = 'https://api.yelp.com/v3/businesses/search'
    superagent.get(yelp_url).auth('', { type: 'bearer' }).query(searchQuery).then((allData) => {

        // console.log(allData.head.businesses);

        let restaurant = allData.body.businesses.map(each => {
            return new Restaurant(each);
        })
        response.status(200).send(restaurant);

    }).catch((error) => {
        console.log(error);
        response.status(500).send("Error in loading RESTURANTS");
    });

}


function getMovies(request, response) {

    const { search_query } = request.query


    const movie_url = `https://api.themoviedb.org/3/movie/top_rated`

    const searchQuery = {
        api_key: MOVIE_API_KEY,
        location: search_query,

    }

    superagent.get(movie_url).query(searchQuery).then(allMovies => {
        // console.log(allMovies.body.results);
        let newMovie = allMovies.body.results.map(each => {
            return new Movie(each);
        })

        response.status(200).send(newMovie);
    }).catch((error) => {
        console.log(error);
        response.status(500).send("Error in loading MOVIES");
    });

}


function getParks(request, response) {

    let parkQuery = {
        api_key: park_API_Key,
        parklimit: 10,
        // q is based on the parks api website which should be a request to city term (search_query in NETWORK)
        q: request.query.search_query
    };

    const url = `https://developer.nps.gov/api/v1/parks`;

    superagent.get(url).query(parkQuery).then(allData => {

        let array = allData.body.data.map(eachPark => {
            return new Park(eachPark);
        })
        response.send(array);

    }).catch((error) => {
        console.log(error);
        response.status(500).send("Error in loading PARKS");
    });
}

// ----------------------------------------------------------



function takeWeather(request, response) {
    // these two lines must be according to the Query string parameter in the console (NETWORK)
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
            return new WeatherDataToFit(eachDay);
        })

        response.send(array)

    }).catch((error) => {
        response.status(500).send("Error in loading WEATHER")
    })

}


// ----------------------------------------------------

function toAddAndRenderFromDB(city) {

    const safeValues = [city];
    const sqlQueryToRenderAll = `SELECT * FROM locations WHERE search_query=$1;`

    return client.query(sqlQueryToRenderAll, safeValues).then(result => {
        if (result.rows.length !== 0) {
            return result.rows[0];

        } else {
            const url = `https://eu1.locationiq.com/v1/search.php`;

            const geoQuery = {
                key: Geo_Key,
                city: city,
                format: 'json'
            };
            return superagent.get(url).query(geoQuery).then(data => {
                const location = new LocationDataToFit(data.body[0], city)

                const safeValues = [city, location.formatted_query, location.latitude, location.longitude];
                const sqlQuery = `INSERT INTO locations ( search_query, formatted_query, latitude, longitude ) VALUES( $1, $2, $3, $4 );`;
                client.query(sqlQuery, safeValues);
                return location;
            }).catch((error, response) => {
                console.log(error);
                response.status(500).send("ERROR!");

            });
        }
    }).catch((error, response) => {
        console.log(error);
        response.status(500).send("ERROR!");
    })
}


// -------------------------------------------------------------

function getLocation(request, response) {
    const { city } = request.query

    if (!city) {
        response.status(404).send("City not found");
    };

    toAddAndRenderFromDB(city).then(result => {

        response.status(200).send(result);
    }).catch((error, response) => {
        console.log(error);
        response.status(500).send("ERROR!");
    })

}


// --------------------------------------------------

function handleError(request, response) {
    response.status(500).send("Sorry, something went wrong")
}

// -----------------------------------------------


//  Constructor functions to fit the data with the frontEnd


function Restaurant(data) {
    this.name = data.name
    this.image_url = data.image_url;
    this.price = data.price;
    this.rating = data.rating;
    this.url = data.url;

}


function Movie(data) {

    this.title = data.title;
    this.overview = data.overview;
    this.average_votes = data.average_votes;
    this.total_votes = data.total_votes;
    this.image_url = data.image_url;
    this.popularity = data.popularity;
    this.released_on = data.released_on;

}

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

function Park(park) {
    this.name = park.fullName;
    this.fee = park.entranceFees[0].cost;
    this.address = `${park.addresses[0].city}, ${park.addresses[0].line1}, ${park.addresses[0].stateCode}, ${park.addresses[0].postalCode}`
    this.description = park.description;
    this.url = park.url
}


//  This to connect to the DB then listen to the port when you run it !
client.connect().then(() => {

    app.listen(PORT, () => {
        console.log('server = ' + PORT)
        console.log("Connected to database:", client.connectionParameters.database)
    });
}).catch((error, response) => {
    console.log(error);
    response.status(500).send("ERROR!");
})