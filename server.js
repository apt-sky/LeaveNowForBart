const http = require('http');
const server_hostname = '127.0.0.1';
const server_port = 3000;

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
                printLeavingTimes(etdItem, 'MLBR');
        });
 };

function printLeavingTimes(etdItem, destinationAbbrv) {
        if (etdItem.abbreviation[0] === destinationAbbrv) {
                var estimates = etdItem.estimate;
                var destination = etdItem.destination[0];
                console.log("The Next Trains to " + destination + " are leaving in ...");
                estimates.forEach(function(estimatesItem) {
                        var minutes = estimatesItem.minutes[0];
                        console.log(minutes + " minutes");
                });
                console.log();
        }
};

const server = http.createServer((req, res) => {
    getEtd();
});

server.listen(server_port, server_hostname, () => {
        console.log(`Server running at http://${server_hostname}:${server_port}/`);
});
