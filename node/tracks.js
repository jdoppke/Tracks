/*
 * Saving this for deployment of an actual setup/environment.
 * This should be the main structure of a working system without
 * demo/dummy data.
 */

var http = require('http');
var spawn = require('child_process').spawn;
var logPath = ''; // Path to log file to tail
var tail;

http.createServer(function(req, res) {

    if (req.headers.accept && req.headers.accept == 'text/event-stream') {

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        tail = spawn('tail', ['-f', path]);
        tail.stdout.on('data', function(data) {
            var dataArr = data.split('\n');
            for (var i=0; i<dataArr.length; i++) {
                res.write('data: ' + dataArr[i] + '\n\n');
            }
        });

    } else {

        res.writeHead(200, {
            'Content-Type': 'text/plain',
        });
        res.write('Connect via Caboose app or some other text/event-stream connection.');
        res.end();

    }

}).listen(8888);
