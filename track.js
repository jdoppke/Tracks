var http = require("http");
var url = require("url");
var spawn = require("child_process").spawn;
var logPath = "/var/log/apache2/watch-tower.log"; // Path to log file to tail

var PING_INTERVAL = 15000;

var tail;

http.createServer(function(req, res) {

    var urlQuery = url.parse(req.url, true);
    var timeSync = urlQuery.query.timeSync;

    if (req.headers.accept && req.headers.accept == "text/event-stream") {

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        });

        setUpTail(res, timeSync);

    } else {

        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Connect via Caboose app or some other text/event-stream connection.");
        res.end();

    }

}).listen(8888);

function setUpTail(res, timeSync) {

    tail = spawn("tail", ["-f", logPath]);
    tail.stdout.on("data", function(data) {
        res.write("data: " + data + "\n\n");
    });

    setInterval(function() {

        var serverDate = "";
        if (timeSync === "server") {
            serverDate = new Date();
        }
        var pingData = "event: ping\ndata: ping" + serverDate + "\n\n";
        res.write(pingData);

    }, PING_INTERVAL);

}
