
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

var searchTerm = "";
var song = ""
var artist = ""

//function to initiate user input using inquirer
function askQuestion() {

    inquirer
        .prompt([
            {
                type: "input",
                message: "What is your name?",
                name: "username"
            },
            {
                type: "list",
                message: "What do you want to ask Liri?",
                choices: ["concert-this", "movie-this", "spotify-this-song", "do-what-it-says"],
                name: "commands"
            },


        ])
        .then(function (inquirerResponse) {// callback that calls when the user has finished asking questions
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            var command = inquirerResponse.commands;
            var name = inquirerResponse.username;
            commands(command);



            // console.log("")
        });
}
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
            console.log('Liri needs to be told what to do...')
    };
}
//calling ask question to start off the app
askQuestion();

//searches the spotify api for a song
function songSearch() {
    if (searchTerm) {


        spotify.search({ type: 'track', query: searchTerm }, function (err, data) {


            if (err) {
                return console.log('Error occurred: ' + err);
            }
            else {
                if
                // If no song is provided then your program will default to "The Sign" by Ace of Base.


                // console.log(data.tracks.items[0]);
                // Artist(s)

                console.log("Artist: " + data.tracks.items[0].artists[0].name);
                // The song's name
                console.log("Song name: " + data.tracks.items[0].name);
                // The album that the song is from
                console.log("album link: " + data.tracks.items[0].external_urls.spotify);
                // A preview link of the song from Spotify
                console.log("song preview: " + data.tracks.items[0].preview_url)


            }

        });


    } else {

        inquirer
            .prompt([
                {
                    type: "input",
                    message: "Ok, well tell me the song title...",
                    name: "song"
                },

            ])
            .then(function (inquirerResponse) {

                if (song === "") {
                    song = "the sign ace of base"
                } else {


                    song = inquirerResponse.song;


                    spotify.search({ type: 'track', query: song }, function (err, data) {


                        if (err) {
                            return console.log('Error occurred: ' + err);
                        }
                        else {
                            // If no song is provided then your program will default to "The Sign" by Ace of Base.


                            console.log(data.tracks.items[0]);
                            // Artist(s)

                            console.log("Artist: " + data.tracks.items[0].artists[0].name);
                            // The song's name
                            console.log("Song name: " + data.tracks.items[0].name);
                            // The album that the song is from
                            console.log("album link: " + data.tracks.items[0].external_urls.spotify);
                            // A preview link of the song from Spotify
                            console.log("song preview: " + data.tracks.items[0].preview_url)


                        }

                    });
                }

            }).catch(function (error) {
                console.error("there was an error: " + error);
            })
    }
}

//function to search OMDB api
function movieSearch() {

    inquirer
        .prompt([
            {
                type: "input",
                message: "Ok, well tell me the movie then...",
                name: "song"
            },

        ])
        .then(function (inquirerResponse) {


            if (movie === "") {
                movie = "Mr. Nobody"
                console.log(`${name}, if you haven't wactched "Mr. Nobody" yet you should! It's on netflix!`)
            } else {

                movie = inquirerResponse.song;
            }



            axios.get("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + omdbKey)
                .then(
                    function (response) {

                        // console.log(response)
                        console.log("\r\n");
                        console.log("Title: " + response.data.Title);
                        console.log("\r\n");
                        console.log("IMDB Rating: " + response.data.Ratings[0].Value);
                        console.log("\r\n");
                        console.log("Rotten Tomatoes: " + response.data.Ratings[1].Value);
                        console.log("\r\n");
                        console.log("Country Produced: " + response.data.Country);
                        console.log("\r\n");
                        console.log("Language: " + response.data.Language);
                        console.log("\r\n");
                        console.log("Plot: " + response.data.Plot);
                        console.log("\r\n");
                        console.log("Actors: " + response.data.Actors);
                        

                    }
                );
        }).catch(function (error) {
            console.error("there was an error: " + error);
        })

}

//node liri.js concert-this <artist/band name here>

function concertSearch() {

    inquirer
        .prompt([
            // Here we create a basic text prompt.
            {
                type: "input",
                message: "Ok, well tell me the name of the artist...",
                name: "artist"
            },

        ])
        .then(function (inquirerResponse) {

            artist = inquirerResponse.artist;

            axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
                .then(
                    function (response) {
                        // Name of the venue
                        // Venue location
                        // Date of the Event (use moment to format this as "MM/DD/YYYY")

                        console.log(response.data[0].lineup)
                        console.log(moment(response.data[0].datetime).format("MMMM Do YYYY, h:mm:ss a"));
                        console.log(response.data[0].venue.city);

                    })
        })

}
// node liri.js do-what-it-says

function doThis() {

    fs.readFile("random.txt", "utf8", function (err, data) {
        // console.log(data)
        if (err) {
            console.log("Error: " + err)
        }
        var commandArr = data.split(",");
        searchTerm = commandArr[1];
        commands(commandArr[0]);

    })
}

function logSearches(){
    fs.appendFile('log.txt', searchTerm, (err) => {
        
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });










// BONUS


// In addition to logging the data to your terminal/bash window, output the data to a .txt file called log.txt.
// Make sure you append each command you run to the log.txt file. 
// Do not overwrite your file each time you run a command.