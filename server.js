var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var host = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig=EMBR&key=MW9S-E7SL-26DU-VV8V'

function getEtd() {
        request(host, function (error, response, body){
                if (error) {
                        console.log('error:', error);
                } 
                else if (response && response.statusCode == 200) {
                        parseString (body, function(err, result) {
                                if (err) {
                                        console.log('Error while parsing response');
                                } else {        
                                        getEtdsForStation(result.root.station[0]);
                                }
                        });
                }
                 else {
                        console.log('Sorry Couldn\'t Retrieve status');
                 }
        });
};

function getEtdsForStation(station) {
        var stationName = station.name;
        var stationEtd = station.etd;

        stationEtd.forEach(function(etdItem){
                if (etdItem.abbreviation[0] === 'MLBR') {
                        var destination = etdItem.destination[0];
                        var minutes = getMinutesForEtd(etdItem);
                        printLeavingTimes(minutes, destination);
                }
        });
 };

function getMinutesForEtd(etdItem) {
        var estimates = etdItem.estimate;
        var minutes = [];
        estimates.forEach(function(estimatesItem) {
                minutes.push(estimatesItem.minutes[0]);
        });

        return minutes;
}

function printLeavingTimes(minutes, destination) {
        console.log("The Next Trains to " + destination + " are leaving in ...");
        minutes.forEach(function(minute) {
                if(isNaN(minute)) {
                        console.log(minute);
                } else {
                        console.log(minute + " minutes");
                }
        });
        console.log();
}

var app = express();

app.get('/', function(req, res) {
        getEtd();
        res.send('Hello World!');
})

app.listen(3000, function() {
        console.log("Example app listening on port 3000!");
})
