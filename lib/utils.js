var path = require('path');
var fs = require('fs');
var MartdowIt = require('markdown-it');
var swig = require("swig-templates");
var rd = require('rd');

var md = new MartdowIt({
	html: true,
	langPrefix: "code-"
});


var stripExtName = function(name) {
	var i = 0 - path.extname(name).length;
	if (i === 0) i = name.length;
	return name.slice(0 ,i);
}

var markdownToHtml = function(content) {
	return md.render(content || "");
}

var parseContent = function(data) {
	var split = '---\n';
	var len = split.length;
	var i = data.indexOf(split);
	var info = {};

	if (i !== -1) {
		var j = data.indexOf(split, i + len);

		if (j !== -1) {
			var str = data.slice(i + len ,j).trim();
			data = data.slice(j + len);
			str.split('\n').forEach(function(line) {
				var i = line.indexOf(":");
				if (i !== -1) {
					var name = line.slice(0, i).trim();
					var value = line.slice(i + 1).trim();
					info[name] =value;
				}
			});	

		}
	}
	info.source = data;
	return info;
}

function renderFile(file, data) {
	var template = swig.compileFile(file);
	var output = template(data);
	return output;
}

function eachSourceFile(sourceDir, callback) {
	rd.eachFileFilterSync(sourceDir, /\.md$/, callback);
}

function renderPost(dir, file) {
	var content = fs.readFileSync(file).toString();
	var post = parseContent(content.toString());
	post.content = markdownToHtml(post.source);
	post.layout = post.layout || "post";

	var config = loadConfig(dir);

	var html = renderFile(path.resolve(dir, '_layout', post.layout + '.html'), { 
		post: post,
		config: config
	});

	return html;
}


function renderIndex(dir) {
	var list = [];
	var sourceDir = path.resolve(dir, "_posts");

	eachSourceFile(sourceDir, function(f, s){
		var source = fs.readFileSync(f).toString();
		var post = parseContent(source);
		post.timestamp = new Date(post.date);
		post.url = "/posts/" + stripExtName(f.slice(sourceDir.length + 1)) + '.html';
		list.push(post);
	});

	list.sort(function(a, b) {
		return b.timestamp - a.timestamp;
	});

	var config = loadConfig(dir);
	var layout = path.resolve(dir, "_layout", "index.html");
	
	var html = renderFile(layout, {
		config: config,
		posts: list
	});

	return html;
}

function loadConfig(dir) {
	var content = fs.readFileSync(path.resolve(dir, "config.json")).toString();
	var data = JSON.parse(content);
	return data;
}

exports.renderPost = renderPost;
exports.renderIndex= renderIndex;
exports.stripExtName = stripExtName;
exports.eachSourceFile = eachSourceFile;
exports.loadConfig = loadConfig;