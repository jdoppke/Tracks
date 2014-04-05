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

/*
    tail = spawn("tail", ["-f", logPath]);
    tail.stdout.on("data", function(data) {
        res.write("data: " + data + "\n\n");
    });
*/

    function randomNum(min, max) {
        do {
            var rand = Math.ceil(Math.random() * max);
        } while(rand < min);
        return rand - 1;
    }

    var spikeOn = false;
    var timer = null;

    setInterval(function() {

        var ind = randomNum(0, 20);
        //var ind = 1;

/*
        if (ind == 0 || spikeOn) {

            console.log("Spike started");
            ind = randomNum(randomNum(21, 30), randomNum(31, 40));
            spikeOn = true;

            if (!timer) {
                var expireIn = randomNum(5, 10) * 1000;
                console.log("Timer set, expiring in " + expireIn + " ms");
                timer = setTimeout(function() {
                    timer = null;
                    spikeOn = false;
                    console.log("Spike stopped");
                }, expireIn);
            }

        }
*/
        for (var i=0; i<ind; i++) {
            var data = dummyData.getLogString();
            res.write("data: " + data + "\n\n");
        }

    }, 1000);

    setInterval(function() {

        var serverDate = "";
        if (timeSync === "server") {
            serverDate = new Date();
        }
        var pingData = "event: ping\ndata: ping" + serverDate + "\n\n";
        res.write(pingData);

    }, PING_INTERVAL);

}

var dummyData = (function() {

    function randomNum(max) {
        var rand = Math.ceil(Math.random() * max);
        return rand - 1;
    }

    function randomNumBetween(min, max) {
        do {
            var rand = Math.ceil(Math.random() * max);
        } while(rand < min);
        return rand - 1;
    }

    function getBrowserString() {
        var strings = [
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.71 (KHTML, like Gecko) Version/6.1 Safari/537.71",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:27.0) Gecko/20100101 Firefox/27.0",
            "Opera/9.80 (Macintosh; Intel Mac OS X 10.7.5) Presto/2.12.388 Version/12.16"
        ];
        var ind = randomNum(10);

        if (ind < randomNumBetween(3,5)) {
            return strings[1];
        }
        if (ind < 5) {
            return strings[randomNum(0,2)];
        }
        return strings[randomNumBetween(2,3)];
    }

    function getBytes(type) {

        // Change to if statement....
        var sample = {
            "html": Math.round(Math.random() * 100000),
            "css" : Math.round(Math.random() * 75000),
            "js"  : Math.round(Math.random() * 200000)
        };

        return sample[type];

    }

    function getFile() {
        var names = ["Indira", "Kermit", "Heidi", "Geraldine", "John", "Keegan", "Caleb", "Lana", "Bertha", "Shaine", "Katell", "Sydnee", "Ulric", "Nevada", "Imogene", "Xyla", "Daniel", "Gretchen", "Candice", "Anjolie", "Uma", "Hoyt", "Kato", "Colby", "Breanna", "Stephen", "Alyssa", "Lydia", "Hamilton", "Reed", "Sonya", "Vielka", "Imani", "Burke", "Cyrus", "Julie", "Gloria", "Dominique", "Aristotle", "Astra", "Brianna", "Nerea", "Dakota", "Marshall", "Jocelyn", "Catherine", "Cassady", "Jordan", "Judith", "Rebecca", "Hilel", "Alexandra", "Castor", "Brandon", "Yardley", "Tashya", "Carter", "Blaine", "Lavinia", "Sopoline", "Macy", "Amy", "Ariel", "Amaya", "Fallon", "Wade", "Seth", "Jonas", "Simon", "Gary", "Lucian", "Maris", "Keaton", "Nichole", "Naida", "Rinah", "Drake", "Montana", "Keelie", "Audrey", "Isabella", "Martina", "Tamekah", "Shaine", "Portia", "Martha", "Nevada", "Cassady", "Nadine", "Zena", "Tashya", "Ava", "Griffin", "Francesca", "Rashad", "Abel", "Lamar", "Callum", "Harlan", "Mollie"];

        var nameNum = randomNum(100);
        var typeNum = randomNum(10);
        var fileName = names[nameNum].toLowerCase();
        var file, size;

        if (typeNum < 2) {
            size = getBytes("html");
            file = fileName + ".html";
            return [file, size];
        }
        if (typeNum < randomNumBetween(4, 6)) {
            size = getBytes("css");
            file = fileName + ".css";
            return [file, size];
        }
        size = getBytes("js");
        file = fileName + ".js";
        return [file, size];
    }

    function getMethod() {
        var num = randomNum(4);
        if (num < 1) {
            return "POST";
        }
        return "GET";
    }

    function getStatus() {
        var num = randomNum(300);
        if (num < 1) {
            //console.log('404');
            //return 404;
        }
        return 200;
    }

    function getLogString() {

        var userAgent = getBrowserString();
        var fileInfo = getFile();

        return JSON.stringify({
            "date": new Date(),
            "user-agent": userAgent,
            "file": fileInfo[0],
            "url": fileInfo[0],
            "bytes": fileInfo[1],
            "method": getMethod(),
            "serve-time": (randomNum(10) * randomNum(3)),
            "ip": "1.1.1.1",
            "status": getStatus()
        });

    }

    return {
        getLogString: getLogString
    };

})();