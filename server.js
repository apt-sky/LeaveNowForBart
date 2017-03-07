var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var CronJob = require('cron').CronJob;

var sourceCode = 'EMBR';
var destinationCode = 'MLBR';
var host = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig='+sourceCode+'&key=MW9S-E7SL-26DU-VV8V'

function getEtd(res) {
        request(host, function (error, response, body){
                if (error) {
                        console.log('error:', error);
                } 
                else if (response && response.statusCode == 200) {
                        parseString (body, function(err, result) {
                                if (err) {
                                        console.log('Error while parsing response');
                                } else {        
                                        var sourceStation = result.root.station[0];
                                        var destinationEtdItem = getDestinationEtdForSourceStation(sourceStation);
                                        var minutes = getMinutesForEtd(destinationEtdItem);
                                        printLeavingTimesToConsole(minutes, destinationEtdItem.destination[0]);
                                        if (res) {
                                                res.send(minutes);
                                        }
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
        getEtd(res);
})

app.listen(3000, function() {
        console.log("LeaveNowForBart app listening on port 3000!");
})

var job = new CronJob('0 */7 * * * *', function(){
        console.log('Run every 7 minutes')
        console.log(new Date());
        getEtd();
}, null, true, 'America/Los_Angeles');

job.start();