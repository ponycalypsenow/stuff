function Technical(){
    var self = this;
    self.reduceWeighted = function(data, reducer, forgettingCurve){
        var forgettingCurve = forgettingCurve || self.constFC;
        var total_w = 0;
        return data.reduce(function(prev, x, xi){
            var w = forgettingCurve(xi);
            total_w += w;
            return reducer(prev, x, xi, w);
        }, 0)/total_w;
    };

    self.range = function(n){
        return Array.apply(null, { length: n }).map(function(x, xi){ return xi; });
    };

    self.constFC = function(){
        return 1.0;
    };

    self.exponentialFC = function(t, S){
        return Math.exp(-t/S);
    };

    self.mean = function(data, forgettingCurve){
        return self.reduceWeighted(data, function(prev, x, xi, w){
            return prev + w*x;
        }, forgettingCurve);
    };

    self.median = function(data, forgettingCurve){
        data = data.map(function(x, xi){
            return [x, (forgettingCurve || self.constFC)(xi)];
        }).sort(function(a, b){ return a[0] - b[0] });
        var halftotal_w = data.reduce(function(prev, x){
            return prev + x[1];
        }, 0)/2.0;
        var i = 0;
        while(halftotal_w > 0) halftotal_w -= data[i++][1];
        return (data.length%2)? data[i - 1][0] : (data[i - 1][0] + data[i][0])/2.0;
    };

    self.autoCorrelation = function(data, lag, forgettingCurve){
        var lag = lag || 1;
        var mu = self.mean(data, forgettingCurve);
        var total = self.reduceWeighted(data, function(prev, x, xi, w){
            return prev + w*Math.pow(x - mu, 2.0);
        }, forgettingCurve);
        return self.reduceWeighted(data, function(prev, x, xi, w){
            if(xi + lag >= data.length) return prev;
            return prev + w*(x - mu)*(data[xi + lag] - mu);
        }, forgettingCurve)/total;
    };

    self.standardDeviation = function(data, forgettingCurve){
        var mu = self.mean(data, forgettingCurve);
        return Math.sqrt(self.reduceWeighted(data, function(prev, x, xi, w){
            return prev + w*Math.pow(x - mu, 2.0);
        }, forgettingCurve));
    };

    self.skewness = function(data, forgettingCurve){
        var mu = self.mean(data, forgettingCurve);
        var m = self.median(data, forgettingCurve);
        var sd = self.standardDeviation(data, forgettingCurve);
        return 3.0*(mu - m)/sd;
    };

    self.rescaledRange = function(data, n){
        var rs = 0;
        for(var i = 0; i < data.length - n; i++){
            var x = data.slice(i, i + n);
            var m = self.mean(x);
            var y = x.map(function(x){ return x - m; });
            var z = y.map(function(x, xi){
                return y.slice(0, xi + 1).reduce(function(prev, x){ return prev + x; }, 0);
            });
            var r = Math.max.apply(null, z) - Math.min.apply(null, z);
            var s = Math.sqrt(self.mean(y.map(function(y){ return y*y; })));
            rs += r/s;
        }

        return rs/(data.length - n);
    };

    self.hurstFactor = function(data){
        var logmax = Math.floor(Math.log(data.length)/Math.LN2);
        var n = self.range(logmax - 1).map(function(i){ return Math.pow(2, i + 2); });
        return  n.map(function(n){ return self.rescaledRange(data, n); });
    };

    return self;
}

if(typeof(module) != "undefined"){
    module.exports.Technical = Technical;
}
