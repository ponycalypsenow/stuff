var gulp = require("gulp");
var args = require("yargs").argv;
var fs = require("fs");
var path = require("path");

String.prototype.negate = function(){ return "!" + this; };
var srcDir = function(filepath){ return "TODO" + args.project + "/trunk/src/" + (filepath || ""); };
var dstDir = function(filepath){ return "TODO" + (filepath || ""); };
var repoDir = function(filepath){ return "TODO" + (filepath || ""); };

gulp.task("populate", function(){
	var copydir = function(src, dst){
		if(!fs.existsSync(dst)) fs.mkdirSync(dst);
		fs.readdirSync(src).forEach(function(x){
			var srcpath = path.join(src, x), dstpath = path.join(dst, x);
			if(!fs.lstatSync(srcpath).isDirectory()) fs.writeFileSync(dstpath, fs.readFileSync(srcpath));
			else copydir(srcpath, dstpath);
		});
	};
	
	["bin", "TODO"].forEach(function(x){ copydir(repoDir(x), dstDir(x)); });
});

gulp.task("copy", function(){
	gulp.src([srcDir("**/*"),
		srcDir("{App_Code,App_Code/**}").negate(),
		srcDir("{bin,bin/**}").negate(),
		srcDir("Web.config").negate()], {base: srcDir()}).pipe(gulp.dest(dstDir(args.project)));
	gulp.src(srcDir("App_Code/**"), {base: srcDir()}).pipe(gulp.dest(dstDir()));
});

gulp.task("observe", function(){
	gulp.watch(dstDir("App_Code/**"), function(event){
		console.log(event);
		gulp.src(event.path, {base: dstDir()}).pipe(gulp.dest(srcDir()));
	});
	
	gulp.watch(dstDir(args.project + "/**/*"), function(event){
		console.log(event);
		gulp.src(event.path, {base: dstDir(args.project)}).pipe(gulp.dest(srcDir()));
	});
});
