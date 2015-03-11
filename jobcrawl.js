var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");

function Promise(){
	var resolved = false;
	var value = null;
	var thenable = [];
	var self = {
		resolved: resolved,
		value: value,
		then: then,
		resolve: resolve
	};
	
	return self;
	function then(callback){
		thenable.push(callback)
		if(resolved) value = callback(value);
		return self;
	}
	
	function resolve(newValue){
		value = newValue;
		for(var i = 0; i < thenable.length; i++) value = thenable[i](value);
		resolved = true;
	}
}

function getPage(url){
	var ret = new Promise();
	console.log(url);
	(/https:\/\//i.test(url)? https : http).get(url, function(res){
		var data = "";
		res.on("data", function(chunk){ data += chunk; });
		res.on("end", function(){ ret.resolve(data); });
	});
	
	return ret;
}

function getAllOccurences(re, s){
	var ret = [];
	var m;
	do{
		m = re.exec(s);
		if(m) ret.push(m[1]);
	}while(m);
	return ret;
}

function getJobs(query){
	var indeedQuery = "http://pl.indeed.com/praca?as_and=" +
		escape(query) +
		"&as_phr=&as_any=&as_not=&as_ttl=&as_cmp=&jt=all&st=&radius=25&l=pozna%C5%84&fromage=7&limit=50&sort=date&psf=advsrch";
	var indeedLink = "http://pl.indeed.com/rc/clk?jk=";
	return getPage(indeedQuery).then(function(page){
		return getAllOccurences(/href="\/rc\/clk\?jk\=([^\'\"]+)/g, page);
	}).then(function(jobs){
		jobs.forEach(function(job){
			var processPage = function(body){
				if(/302 moved/i.test(body)){
					getPage(getAllOccurences(/href="([^\'\"]+)/gi, body)[0]).then(processPage);
				}else{
					try{
						fs.statSync(query);
					}catch(e){
						fs.mkdirSync(query);
					}
					
					try{
						fs.statSync(path.join(query, job + ".html"));
					}
					catch(e){
						fs.writeFileSync(path.join(query, job + ".html"), body);
					}
				}
			};
			
			getPage(indeedLink + job).then(processPage);
		});
	});
}
