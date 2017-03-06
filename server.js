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
                    console.log('Error while parsing response')        
                } else {
                    var destinations = result.root.station.etd;
                    var stationEmbr = result.root.station[0];
                    var stationEmbrName = stationEmbr.name;
                    var stationEmbrEtd = stationEmbr.etd;

                    stationEmbrEtd.forEach(function(etdItem){
                        if(etdItem.abbreviation[0] === 'MLBR') {
                            var estimates = etdItem.estimate;
                            estimates.forEach(function(estimatesItem){
                                console.log(estimatesItem.minutes[0]);
                            });
                        }
                    });
                }
            });
        }
        else {
            console.log('Sorry Couldn\'t Retrieve status')
        }
    });
};

const server = http.createServer((req, res) => {
    getEtd();
});

server.listen(server_port, server_hostname, () => {
        console.log(`Server running at http://${server_hostname}:${server_port}/`);
});
