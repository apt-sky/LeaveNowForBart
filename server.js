var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var CronJob = require('cron').CronJob;

var sourceCode = 'EMBR';
var destinationCode = 'MLBR';
var host = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig='+sourceCode+'&key=MW9S-E7SL-26DU-VV8V'

function getEtd(callback) {
        request(host, function (error, response, body){
                if (error) {
                        console.log('error:', error);
                } 
                else if (response && response.statusCode == 200) {
                        parseString (body, function(err, result) {
                                if (err) {
                                        console.log('Error while parsing response');
                                } else {        
                                        var minutes = []
                                        var sourceStation = result.root.station[0];
                                        var destinationEtdItem = getDestinationEtdForSourceStation(sourceStation);
                                        if (destinationEtdItem) {
                                                minutes = getMinutesForEtd(destinationEtdItem);
                                                printLeavingTimesToConsole(minutes, destinationEtdItem.destination[0]);
                                        }
                                        console.log("Returning minutes: " + minutes);
                                        callback(minutes);
                                }
                        });
                }
                 else {
                        console.log('Sorry Couldn\'t Retrieve status');
                 }
        });
};

function getDestinationEtdForSourceStation(station) {
        var destinationEtdItem = station.etd.find(isEtdRequiredDestination);
        return destinationEtdItem;
};

function isEtdRequiredDestination(etdItem) {
        return (etdItem.abbreviation[0] === destinationCode);
};

function getMinutesForEtd(etdItem) {

        var estimates = etdItem.estimate;
        var minutes = [];
        estimates.forEach(function(estimatesItem) {
                minutes.push(estimatesItem.minutes[0]);
        });

        return minutes;
}

function printLeavingTimesToConsole(minutes, destination) {

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
        console.log("Server called to get ETD");
        getEtd(function(minutes){
                console.log('Server Returned minutes: ' + minutes);
                res.send(minutes);
        });
})

app.listen(3000, function() {
        console.log("LeaveNowForBart app listening on port 3000!\n");
})

var job = new CronJob('0 */7 * * * *', function(){
        console.log('CronJob running every 7 minutes to get ETD');
        console.log(new Date());
        getEtd(function(minutes){
                console.log("Server Returned minutes for CronJob: " + minutes);
        });
}, null, true, 'America/Los_Angeles');

job.start();