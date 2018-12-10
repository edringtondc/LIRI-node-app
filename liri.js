
//required node packages
require('dotenv').config()
var keys = require("./keys")
var fs = require('fs')
var axios = require("axios");
var Spotify = require('node-spotify-api');
var moment = require('moment');
var inquirer = require('inquirer');
//api key variables
var spotify = new Spotify(keys.spotify);
var omdbKey = "trilogy";

var name = "";
var song = ""
var artist = ""
var movie = ""




//function to initiate user input using inquirer
function askQuestion() {
    //confirms user wants to continue, if not program terminates
    inquirer.prompt([
        {
            type: "confirm",
            message: "Do you want to use Liri-bot?",
            name: "confirm"
        }
    ]).then(function (inquirerResponse) {

        if (inquirerResponse.confirm) {

            inquirer.prompt([
                {
                    type: "list",
                    message: "What do you want to ask Liri?",
                    choices: ["concert-this", "movie-this", "spotify-this-song", "do-what-it-says"],
                    name: "commands"
                },
            ])
                .then(function (inquirerResponse) {
                    //the choice the user makes is stored in command and then passed into the command function, to determine what happens next
                    var command = inquirerResponse.commands;
                    commands(command);
                });

        } else {
            console.log(`Ok Have a nice day!`)
        }
    })
}
//function that starts the program
function sayHello() {
    //asks user their name
    inquirer.prompt([
        {
            type: "input",
            message: "What is your name",
            name: "name"
        }
    ]).then(function (inquirerResponse) {
        name = inquirerResponse.name
        console.log(`Hello, ${name}`)
        askQuestion();

    }).catch(function (error) {
        console.error("there was an error: " + error);
    })
}
//calling sayHello to start the program
sayHello();


// function to handle the commands from the user input
function commands(command) {
    switch (command) {
        case "concert-this":
            concertSearch();
            break;
        case "movie-this":
            movieSearch();
            break;
        case "spotify-this-song":
            songSearch();
            break;
        case "do-what-it-says":
            doThis();
            break;
        default:
            console.log('Liri needs to be told what to do...');
    };
}

//searches the spotify api for a song
function songSearch() {
    //asks user the title of the song they want to search
    inquirer
        .prompt([
            {
                type: "input",
                message: "Ok, well tell me the song title...",
                name: "song"
            },
        ])
        .then(function (inquirerResponse) {
            //checks to see that they answered. If no response, the default is The sign, by Ace of Base
            if (inquirerResponse.song) {
                song = inquirerResponse.song;
            }
            else {
                song = "The Sign Ace of Base";
            }
            //starts spotify call based on song 
            spotify.search({ type: 'track', query: song }, function (err, data) {

                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                else {
                    //prints song data from spotify, and logs it to the searches
                    // console.log(data.tracks.items[0]);
                    var data = data.tracks.items[0]
                    var songData = [`
    Artist: ${data.artists[0].name} 
    Song name: ${data.name} 
    Album link: ${data.external_urls.spotify} 
    Song preview: ${data.preview_url}
    `].join("/n/r")
                    console.log("Thanks " + name)
                    console.log(songData);
                    logSearches(songData);
                    askQuestion();
                }
            });
        }).catch(function (error) {
            console.error("there was an error: " + error);
        })
}

//function to search OMDB api
function movieSearch() {
    //asks user for movie title
    inquirer
        .prompt([
            {
                type: "input",
                message: "Ok, well tell me the movie then...",
                name: "movie"
            },
        ])
        .then(function (inquirerResponse) {
            //checks if user entered a movie, if not it defaults to Mr Nobody
            if (inquirerResponse.movie) {
                movie = inquirerResponse.movie;
            }
            else {
                movie = "Mr. Nobody";
                console.log("If you haven't seen Mr. Nobody, you should. Its on Netflix")
            }
            axios.get("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + omdbKey)
                .then(
                    function (response) {

                        var movieData = [`
    Title: ${response.data.Title} 
    IMDB rating: ${response.data.Ratings[0].Value} 
    Rotten Tomatoes rating: ${response.data.Ratings[1].Value} 
    Country Produced: ${response.data.Country} 
    Language: ${response.data.Language} 
    Plot: ${response.data.Plot} 
    Actors: ${response.data.Actors} 
                    `].join("/n/r")

                        console.log(movieData);
                        logSearches(movieData);
                        askQuestion();
                    }
                );
        }).catch(function (error) {
            console.error("there was an error: " + error);
        })
}

//function to check bandsintown API for upcoming shows
function concertSearch() {
    //asks user for the bad to search
    inquirer
        .prompt([
            {
                type: "input",
                message: "Ok, well tell me the name of the artist...",
                name: "artist"
            },
        ])
        .then(function (inquirerResponse) {
            artist = inquirerResponse.artist
            //searches bands in town via axios 
            axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
                .then(
                    function (response) {
                        // console.log(response.data[0])
                        //checks if there is a response, if not its tells the user they don't have shows coming up
                        if (response) {

                            var artistData = [`
    Artist: ${artist}
    Date and Time: ${moment(response.data[0].datetime).format("MMMM Do YYYY, h:mm:ss a")}
    Venue Location: ${response.data[0].venue.city}       
    `].join("/n/r")
                            console.log(artistData);
                            logSearches(artistData);
                        }
                        else {
                            console.log("Sorry, this artist does not have any shows coming up")
                        }
                        askQuestion();

                    }).catch(function (error) {
                        console.error("there was an error: " + error);
                    })
        })
}

//reads the file random.txt to do what it says
function doThis() {

    fs.readFile("random.txt", "utf8", function (err, data) {
        // console.log(data)
        if (err) {
            console.log("Error: " + err)
        }

        var commandArr = data.split(",");
        searchTerm = commandArr[1];
        command = commandArr[0];

        spotify.search({ type: 'track', query: searchTerm }, function (error, data) {

            if (error) {
                return console.log('Error occurred: ' + error);
            }
            else {
              
                var songData = [`
    Artist: ${data.tracks.items[0].artists[0].name} 
    Song name: ${data.tracks.items[0].name} 
    Album link: ${data.tracks.items[0].external_urls.spotify} 
    Song preview: ${data.tracks.items[0].preview_url}
    `].join("/n/r")

                console.log(songData);
                logSearches(songData)
                askQuestion();
            }
        });
    })
}

//function to log the searched data to log.txt
function logSearches(term) {

    fs.appendFile("log.txt", term, function (err) {
        if (err) throw err;
    })

}