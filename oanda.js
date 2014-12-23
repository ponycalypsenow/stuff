var https = require("https");
var utils = require("./utils.js");

var DOMAIN = "api-fxpractice.oanda.com";
var ACCESS_TOKEN = "";
var ACCOUNT_ID = "";

function Oanda(){
    var self = this;
    self.oandaRequest = function(method, path, params){
        function makeQuery(){
            return Object.keys(params).reduce(function(prev, key, keyi){
                return prev + (keyi == 0? "" : "&") + key + "=" + params[key];
            }, "");
        }

        function makePath(){
            var ret = path;
            if(method == "GET" && Object.keys(params).length > 0) ret = ret + "?" + makeQuery();
            return ret.replace(":account_id", ACCOUNT_ID).replace(":trade_id", params["trade_id"]);
        }

        var post_data = makeQuery();
        var options = {
            host: DOMAIN,
            path: makePath(),
            method: method,
            headers: method != "POST"? {
                "Authorization" : "Bearer " + ACCESS_TOKEN
            } : {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": post_data.length,
                "Authorization": "Bearer " + ACCESS_TOKEN
            }
        };

        var ret = new utils.Promise();
        var request = https.request(options, function(response){
            var data = "";
            response.on("data", function(chunk){
                data = data + chunk.toString();
            });
            response.on("end", function(){
                if(response.statusCode != 200){
                    console.log(response.statusCode);
                    console.log(data);
                }

                ret.resolve(JSON.parse(data));
            });
        });

        if(method == "POST") request.write(post_data);
        request.end();
        return ret;
    };

    self.getInstruments = function(){
        return  self.oandaRequest("GET", "/v1/instruments", {
            accountId: ":account_id"
        });
    };

    self.getInstrumentHistory = function(instrument, granularity, count){
        return  self.oandaRequest("GET", "/v1/candles", {
            instrument: instrument,
            granularity: granularity,
            count: count
        });
    };

    self.getPrices = function(instruments){
        instruments = instruments.instruments.map(function(x){
            return x.instrument;
        });

        function getInstruments(){
            return instruments.reduce(function(prev, x, xi){
                return prev + (xi > 0? "%2C" : "") + x;
            }, "");
        }

        return  self.oandaRequest("GET", "/v1/prices", { "instruments": getInstruments() });
    };

    self.makeOrder = function(instrument, units, side, type){
        return  self.oandaRequest("POST", "/v1/accounts/:account_id/orders", {
            instrument: instrument,
            units: units,
            side: side,
            type: type
        });
    };

    self.getOpenTrades = function(){
        return self.oandaRequest("GET", "/v1/accounts/:account_id/trades", {});
    };

    self.closeTrade = function(trade_id){
        return  self.oandaRequest("DELETE", "/v1/accounts/:account_id/trades/:trade_id", {
            trade_id: trade_id
        });
    };

    return self;
}

if(typeof(module) != "undefined"){
    module.exports.Oanda = Oanda;
}
