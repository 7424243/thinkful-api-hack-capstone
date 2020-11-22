'use strict';

/*** API Keys & Base URLS ***/

//variable to hold apiKeys
const apiKeyOpenCage = '186aeff2de054932ad6fc90fa36c6c37';
const apiKeyOpenWeather = '42f989035320f151b7d2e585ddc2d3f8';
const apiKeyStormGlass = '1307e8d4-29e9-11eb-8db0-0242ac130002-1307e960-29e9-11eb-8db0-0242ac130002';

//variable to hold base urls
const baseURLOpenCage = 'https://api.opencagedata.com/geocode/v1/json';
const baseURLOpenWeather = 'https://api.openweathermap.org/data/2.5/weather'; 
const baseTideURLStormGlass = 'https://api.stormglass.io/v2/tide/extremes/point';
const baseAstronomyURLStormGlass = 'https://api.stormglass.io/v2/astronomy/point';


let myData = {};

//functions to handle browser location
function getBrowserLocation() {
    $('.browser-location-form').submit(event => {
        event.preventDefault();
        $('.submit-message').removeAttr('hidden');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                displayPosition,
                displayError,
                {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
            );
        }  else {
            alert('Geolocation is not supported by this browser.');
        };
    });
        
}
function displayPosition(position) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(tz);
    myData.lat = position.coords.latitude;
    myData.lng = position.coords.longitude;
    myData.timeZone = tz;
    
    getWeatherData();
}

function displayError(error) {
    var errors = {
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
    };
    alert('Error: ' + errors[error.code] + '. Please try typing in the desired location in the input on the web page.');
}

    

//function to handle search input
function watchSearchButton() {
    $('.location-form').submit(event => {
        event.preventDefault();
        const location = $('.location-text-input').val();
        console.log(location);
        $('.submit-message').removeAttr('hidden');
        getCoordinates(location);
    });
}


//function to format query params
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }


/*** Location Section ***/

//function to get lat/long coordinates in console.log (for errors, make sure to unhide <h4> error message)
function getCoordinates(location) {
    
    const params = {
        key: apiKeyOpenCage,
        q: location,
        limit: 1
    };

    const queryString = formatQueryParams(params);
    const urlOpenCage = baseURLOpenCage + '?' + queryString;

    console.log(urlOpenCage);

    fetch(urlOpenCage)
        .then(function (response) {
            if (response.ok) {
                return response.json();
              }
              throw new Error(response.statusText);
        })
        .then(function (responseJson) {

            myData.lat = responseJson.results[0].geometry.lat;
            myData.lng = responseJson.results[0].geometry.lng;
            myData.timeZone = responseJson.results[0].annotations.timezone.name;
           console.log(responseJson);
            getWeatherData();
            
        })
        .catch(function (error) {
            $('.submit-message').attr('hidden', true);
            $('.invalid-message').removeAttr('hidden');
        });
}




/*** Results Section Functions ***/

//function to get weather data
function getWeatherData() {

    const weatherParams = {
        lat: myData.lat,
        lon: myData.lng,
        units: 'imperial',
        appid: apiKeyOpenWeather,
    };

    const weatherQueryString = formatQueryParams(weatherParams);
    const urlOpenWeather = baseURLOpenWeather + '?' + weatherQueryString;

    console.log(urlOpenWeather);
    
    fetch(urlOpenWeather)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(function (responseJson) {

            myData.cityName = responseJson.name;
            myData.temp = responseJson.main.temp;
            myData.humidity = responseJson.main.humidity;
            myData.weatherType = responseJson.weather[0].main;
            myData.weatherTypeDescription = responseJson.weather[0].description;
            myData.weatherTypeIcon = responseJson.weather[0].icon;
            myData.windSpeed = responseJson.wind.speed;
            console.log(responseJson);
            getTideData();
        })
        .catch(function (error) {
            $('.submit-message').attr('hidden', true);
            $('.invalid-message').removeAttr('hidden');
        });
}


//function to get tide data
function getTideData() {
    
    const tideParams = {
        lat: myData.lat,
        lng: myData.lng
    };

    const tideQueryString = formatQueryParams(tideParams);
    const urlTides = baseTideURLStormGlass + '?' + tideQueryString;

    console.log(urlTides);

    fetch(urlTides, {
        headers: {
            'Authorization': apiKeyStormGlass
        }
        })        
        .then(function (response) {
            if (response.ok) {
                return response.json();
              }
              throw new Error(response.statusText);
        })
        .then(function (responseJson) {

            myData.tides = [responseJson.data[1], responseJson.data[2], responseJson.data[3], responseJson.data[4]]
            console.log(responseJson);
            getAstronomyData();
        })
        .catch(function (error) {
            $('.submit-message').attr('hidden', true);
            $('.invalid-message').removeAttr('hidden');
    });
    
    //San Diego
  //myData.tides = [{time: "2020-11-21T11:40:00+00:00", type: "high"}, {time: "2020-11-21T16:06:00+00:00", type: "low"}, {time: "2020-11-21T21:24:00+00:00", type: "high"}, {time: "2020-11-22T05:07:00+00:00", type: "low"}]
   //getAstronomyData();

}

//function to get astronomy data
function getAstronomyData() {
    
    const astronomyParams = {
        lat: myData.lat,
        lng: myData.lng
    };

    const astronomyQueryString = formatQueryParams(astronomyParams);
    const urlAstronomy = baseAstronomyURLStormGlass + '?' + astronomyQueryString;
    
    console.log(urlAstronomy);

    fetch(urlAstronomy, {
        headers: {
            'Authorization': apiKeyStormGlass
        }
        })        
        .then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
        .then(function (responseJson) {

            myData.moonPhase = responseJson.data[0].moonPhase.current.text;
            myData.sunrise = responseJson.data[0].sunrise;
            myData.sunset = responseJson.data[0].sunset;
            console.log(responseJson);
            console.log(myData);

            displayData();
        })
        .catch(function (error) {
            $('.submit-message').attr('hidden', true);
            $('.invalid-message').removeAttr('hidden');
    });
   

    //San Diego
    //myData.moonPhase = "Waxing crescent";
    //myData.sunrise = "2020-11-21T14:26:08+00:00";
    //myData.sunset = "2020-11-22T00:46:12+00:00";
    //console.log(myData);
    //displayData();

}

//function to display weather data
function displayData() {

    $('.city').empty();
    $('.results-weather').empty();
    $('.results-tides').empty();
    $('.results-sun-moon').empty();
    $('.invalid-message').attr('hidden', true);
    

    
    $('.city').append('City: ' + myData.cityName);
    $('.city').removeAttr('hidden');
    $('.city-warning').removeAttr('hidden')

    
    $('.results-weather').append(`<li>Temperature: ${myData.temp}˚F</li>`);
    $('.results-weather').append(`<li>Weather Type: ${myData.weatherType} - ${myData.weatherTypeDescription}</li>`);
    $('.results-weather').append(`<li>Wind Speed: ${myData.windSpeed}mph</li>`);
    $('.results-weather').append(`<li>Humidity: ${myData.humidity}%</li>`);
    $('.results-weather').removeAttr('hidden');

    $('.results-tides').append(`<li>${myData.tides[0].type}: ${new Date(myData.tides[0].time).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-tides').append(`<li>${myData.tides[1].type}: ${new Date(myData.tides[1].time).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-tides').append(`<li>${myData.tides[2].type}: ${new Date(myData.tides[2].time).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-tides').append(`<li>${myData.tides[3].type}: ${new Date(myData.tides[3].time).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-tides').removeAttr('hidden');

    $('.results-sun-moon').append(`<li>Sunrise: ${new Date(myData.sunrise).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-sun-moon').append(`<li>Sunset: ${new Date(myData.sunset).toLocaleTimeString([], {hour12: true, hour: '2-digit', minute: '2-digit', timeZone: myData.timeZone, timeZoneName: 'short'})}</li>`);
    $('.results-sun-moon').append(`<li>Moon Phase: ${myData.moonPhase}</li>`);
    $('.results-sun-moon').removeAttr('hidden');

    $('.submit-message').attr('hidden', true);
    $('.location-text-input').val('');
}

/*** Document Ready ***/

//document ready
$(watchSearchButton(), getBrowserLocation());