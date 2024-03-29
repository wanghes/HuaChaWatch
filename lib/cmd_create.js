var path = require('path');
var utils = require("./utils");
var fse = require("fs-extra");
var moment = require("moment");

module.exports = function(dir) {
	dir = dir || ".";

	fse.mkdirsSync(path.resolve(dir, "_layout"));
	fse.mkdirsSync(path.resolve(dir, "_posts"));
	fse.mkdirsSync(path.resolve(dir, 'assets'));
	fse.mkdirsSync(path.resolve(dir, "posts"));

	var tplDir = path.resolve(__dirname, "../tpl");

	fse.copySync(tplDir, dir);

	newPost(dir, "hello world", "这是第一个博文");

	console.log("ok");

}

function newPost(dir, title, content) {
	var data = [
		"---",
		"title: " + title,
		"date: " + moment().format("YYYY-MM-DD"),
		"---",
		"",
		content
	].join('\n');
	var name = moment().format("YYYY-MM") + "/hello-world.md";
	var file = path.resolve(dir, "_posts", name);
	fse.outputFileSync(file, data);
}

