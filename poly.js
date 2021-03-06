var fs = require("fs");

var Frame = function(data, names){	
	if(!names){
		names = data[0];
		data = data.slice(1);
	}
	
	var columns = {};
	names.forEach(function(name, i){
		columns[name] = isNaN(data[0][i])?
			data.map(function(x){ return x[i]; }) :
			Poly(data.map(function(x){ return parseFloat(x[i]); }));
	});
	
	columns.names = names;
	return columns;
};

Frame.fromCsv = function(name){
	return Frame(fs.readFileSync(name).toString().
		split("\n").
		filter(function(x){ return x.length > 0; }).
		map(function(x){ return x.split(","); }));
};

var Poly = function(data){
	var a = data || [];
	while(a[a.length - 1] == 0) a.pop();
	a = a.map(function(x){ return x || 0; });
	return{
		deg: function(){ return a.length - 1; },
		lc: function(){ return a[a.length - 1]; },
		a: a,
		derivative: function(){
			return Poly(a.map(function(a, ai){ return a*ai; }).slice(1));
		},
		integral: function(){
			return Poly([0].concat(a).map(function(a, ai){
				return ai > 0? a/ai : 0;
			}));
		},
		value: function(x){
			return a.reduce(function(prev, a, ai){
				return prev + a*Math.pow(x, ai);
			}, 0);
		},
		report: function(){
			return a.reduce(function(prev, a, ai, all){
				return prev + (a != 0? (ai > 0?
					(prev.length > 0? " + " : "") +
					(a != 1? a : "") + "x" + (ai > 1? ai : "") : a) : "");
			}, "");
		}
	};
};

Poly.ident = function(n, a){
	var ret = [];
	ret[n] = a || 1;
	return Poly(ret);
};

Poly.permuts = function(n, a){
	var a = a || [0, 1, 1, 2, 3, 5, 8, 13, 0, -1, -1, -2, -3, -5, -8, -13];
	var n = n || a.length;
	var permuts = function(s){
		if(s.length == a.length - n + 1) return s;
		return s.reduce(function(prev, a, i){
			var rest = s.slice(0, i).concat(s.slice(i + 1));
			return prev.concat(permuts(rest).map(function(x){ return [a].concat(x); }));
		}, []);
	};
	
	return permuts(a).map(function(x){ return Poly(x); });
};

Poly.zip = function(l, r){
	l = l instanceof Array? Poly(l) : l, r = r instanceof Array? Poly(r) : r;
	var ret = [], n = Math.max(l.deg(), r.deg());
	for(var i = 0; i <= n; i++) ret[i] = [l.a[i] || 0, r.a[i] || 0];
	ret.l = l, ret.r = r;
	return ret;
};

Poly.add = function(l, r){
	return Poly(Poly.zip(l, r).map(function(a){ return a[0] + a[1]; }));
};

Poly.sub = function(l, r){
	return Poly(Poly.zip(l, r).map(function(a){ return a[0] - a[1]; }));
};

Poly.mul = function(l, r){
	var ret = [], zip = Poly.zip(l, r), a = zip.l.a, b = zip.r.a;
	for(var i = 0; i < a.length; i++)
		for(var j = 0; j < b.length; j++)
			ret[i + j] = (ret[i + j] || 0) + a[i]*b[j]; 	
	return Poly(ret);
};

Poly.div = function(l, r){
	var zip = Poly.zip(l, r), a = r = zip.l, b = zip.r, q = [];
	for(var i = a.deg() - b.deg(); i >= 0; i--){
		if(r.deg() == b.deg() + i){
			q[i] = r.lc()/b.lc();
			r = Poly.sub(r, Poly.mul(Poly.ident(i, q[i]), b));
		}else q[i] = 0;
	}

	var ret = Poly(q);
	ret.error = r;
	return ret;
};
