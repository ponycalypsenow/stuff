var fs = require("fs");

var getTree = function(name){
	var body = fs.readFileSync(name).toString();
	var getRevisions = function(body){	
		return body.match(/Revision:([\s\S]*?)(?:(?:\r?\n){2}|$)/g);
	};

	var getModifications = function(revision){
		return (revision.match(/Modified : .*/g) || []).map(function(x){ return x.split(" : ")[1]; });
	};
	
	return getRevisions(body).map(function(revision){ return getModifications(revision); });
};

var getTable = function(tree){
	var ret = [], files = [];
	tree.forEach(function(revision){
		revision.forEach(function(a){
			if(files.indexOf(a) < 0) files.push(a);
			revision.forEach(function(b){
				if(files.indexOf(b) < 0) files.push(b);
				ret[files.indexOf(a)] = ret[files.indexOf(a)] || [];
				ret[files.indexOf(a)][files.indexOf(b)] = (ret[files.indexOf(a)][files.indexOf(b)] || 0) + 1;
			});
		});
	});
	
	ret.forEach(function(row){
		for(var i = 0; i < files.length; i++) row[i] = row[i] || 0;
	});
	
	ret.files = files;
	return ret;
};

var getCorr = function(table, thresh){
	var ret = [], thresh = thresh || 0.68;
	for(var i = 0; i < table.files.length; i++){
		for(var j = 0; j < table.files.length; j++){
			if(i == j) continue;
			var p = (table[i][j] + 1.0)/(table[i][i] + 2.0);
			if(p > thresh) ret.push([table.files[i], table.files[j]]);
		}
	}
	
	return ret;
};
