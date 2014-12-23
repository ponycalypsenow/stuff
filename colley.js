var fs = require('fs');

var Csv = function(name){
	var self = this, rows = fs.readFileSync(name).toString().split('\n').map(function(x) { return x.split(','); });
	self.fieldNames = function(){ return rows[0]; }
	var rowNo = 0;
	self.readRow = function(){
		var ret = {};
		if(++rowNo >= rows.length) return null;
		for(var i = 0; i < rows[rowNo].length; i++)
			if(rows[0][i].length == 0) continue;
			else ret[rows[0][i]] = isNaN(rows[rowNo][i])? rows[rowNo][i] : parseFloat(rows[rowNo][i]);
		return ret;
	}
	
	return self;
};

function gauss(a){
	var n = a.length;
	for(var i = 0; i < n; i++){
		var max = a[i], maxi = i;
		for(var k = i + 1; k < n; k++)
			if(Math.abs(a[k][i]) > max[i]) max = a[k], maxi = k;
		a[maxi] = a[i], a[i] = max;
		for(k = i + 1; k < n; k++){
			var c = -a[k][i]/a[i][i];
			for(var j = i; j <= n; j++) a[k][j] = (i == j)? 0: a[k][j] + c*a[i][j];
		}
	}
	
	var x = [];
	for(i = n - 1; i >= 0; i--){
		x[i] = a[i][n]/a[i][i];
		for(var k = i - 1; k >= 0; k--) a[k][n] -= a[k][i]*x[i];
	}
	
	return x;
}

function relativeTo(row, currency){
	var ret = {};
	for(var key in row){
		if(isNaN(row[key])){
			ret[key] = row[key];
			if(key == "Date") ret.EUR = 1.0/row[currency];
		}else ret[key] = row[key]/row[currency];
	}
	
	return ret;
}

function schedule(prior, current){
	var ret = [], names = [];
	for(var key in prior) names.push((key != "Date")? key : "EUR");
	var n = names.length;
	for(var i = 0; i < n; i++){
		ret[i] = [];
		var relativePrior = relativeTo(prior, names[i]);
		var relativeCurrent = relativeTo(current, names[i]);
		for(var j = 0; j < n; j++) ret[i][j] = relativePrior[names[j]] > relativeCurrent[names[j]]? 1 : 0;
	}
	
	return ret;
}
