const fs = require('fs');
const path = require("path");
const vorpal = require('vorpal')();
const shell = require('shelljs');
const readline = require('line-by-line');
const chalk = require('chalk');

var pkg_config = JSON.parse(shell.cat('package.json').stdout);



var js_template = `/*
 *  :;name;: - Component Tagline
 *
 *	Basic Description of Component
 *
*/

Ractive.components[':;name;:'] = Ractive.extend({
	isolated: true,
	data: {
		component_name: ":;name;:"
	},
	template: "<div class='{{component_name}}''></div>"
});
`;

var sass_template = `.:;name;:{
	
}
`;

var injectDataIntoTemplate = function(template, data){
	let template_delimiters = [":;", ";:"];
	let a = template.split(template_delimiters[0])
	for(var i = 0; i < a.length; i++){
		if(a[i].indexOf(template_delimiters[1]) > -1){
			a[i] = data[a[i].split(template_delimiters[1])[0]] + a[i].split(template_delimiters[1])[1]; 
		}
	}
	return a.join("");
}






vorpal.command('new-component <name>', "Create new component")
	.alias("nc")
	.action(function(args, cb){
		try {

			// Inform user
			this.log("Creating new component: "+args.name+"\n");

			// Check if files exist
			if(
				shell.cat( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js").code != 1 ||
				shell.cat( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss").code != 1
			){
				this.log("Component with name "+args.name+" exists or hasn\'t finished removal, use remove-component command!")
			} else {
				let self = this;

				// Create component JS file
				let js_content = injectDataIntoTemplate(js_template, {name: args.name});
				shell.touch( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js");
				shell.chmod(777,  path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js");
				fs.writeFileSync( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js", js_content, {mode: 777});
				this.log( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js - Created!");

				// Create component SCSS file
				let sass_content = injectDataIntoTemplate(sass_template, {name: args.name});
				shell.touch( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss");
				shell.chmod(777,  path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss");
				fs.writeFileSync( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss", sass_content, {mode: 777});
				this.log( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss - Created!");

				// Add to component JSON file
				let comp_list = JSON.parse(shell.cat('components.json').stdout);
				comp_list[args.name] = {};
				comp_list[args.name]["js"] = "src/components/"+args.name+".anatomy-component.js";
				comp_list[args.name]["sass"] = "src/styles/"+args.name+".anatomy-component.scss";
				comp_list[args.name]["created_at"] = new Date().toString();
				let comp_list_str = JSON.stringify(comp_list);
				fs.writeFileSync("./components.json", comp_list_str, {mode: 777});
				this.log("components.json - Updated!");

				// Add import reference to main.scss
					let lr = new readline('src/styles/main.scss');
					let lines = [];
				lr.on('line', function (line) {
					if (line.indexOf(args.name + ".anatomy-component.scss") > -1){
						self.log("Component\'s Style file is already referenced in main.scss!? Removing it...");
					} else {
						lines.push(line);
					}
				});
				lr.on('end', function () {
					lines.push("@import \'"+args.name+".anatomy-component.scss\';");
					fs.writeFile("src/styles/main.scss", lines.join("\n"), function(err) {
							self.log("src/styles/main.scss - Updated!");
					}); 
				});

			}

			
			cb();

		} catch (e) {
			self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
		}
});






var getComponentNames = function(){
	let comp_list = JSON.parse(shell.cat('components.json').stdout);
	let component_names = ["*"];
	for(var k in comp_list) component_names.push(k);
	return component_names;
}
vorpal.command('remove-component <name>', "Remove component")
	.alias("rc")
	.autocomplete(getComponentNames())
	.action(function(args, cb){
		try {

			// Check for Asterisk Wildcard
			if (args.name == "*"){
				let self = this;
				shell.rm('-fR',  path.resolve(process.cwd()) +"/src/components/*.anatomy-component.js");
				this.log( path.resolve(process.cwd()) +"/src/components/*.anatomy-component.js - Removed!");

				shell.rm('-fR',  path.resolve(process.cwd()) +"/src/styles/*.anatomy-component.scss");
				this.log( path.resolve(process.cwd()) +"/src/styles/*.anatomy-component.scss - Removed!");

				fs.writeFileSync("./components.json", "{}", {mode: 777});
				this.log("components.json - Updated!");

					let lr = new readline('src/styles/main.scss');
					let lines = [];
				lr.on('line', function (line) {
					if (line.indexOf("anatomy-component.scss") < 0){
						lines.push(line);
					}
				});
				lr.on('end', function () {
					fs.writeFile("src/styles/main.scss", lines.join("\n"), function(err) {
							self.log("src/styles/main.scss - Updated!");
					}); 
				});
			} else {
			
				// Inform user
				this.log("Removing new component: "+args.name+"\n");

				// Check if files exist
				if(
					shell.cat( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js").code == 1 ||
					shell.cat( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss").code == 1
				){
					this.log("Component with name "+args.name+" does not exist, use create-component command!")
				} else {
					let self = this;

					// Remove component JS file
					shell.rm('-f',  path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js");
					this.log( path.resolve(process.cwd()) +"/src/components/"+args.name+".anatomy-component.js - Removed!");

					// Remove component SCSS file
					shell.rm('-f',  path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss");
					this.log( path.resolve(process.cwd()) +"/src/styles/"+args.name+".anatomy-component.scss - Removed!");

					// Remove from component JSON file
					let comp_list = JSON.parse(shell.cat('components.json').stdout);
					delete comp_list[args.name];
					let comp_list_str = JSON.stringify(comp_list);
					fs.writeFileSync("./components.json", comp_list_str, {mode: 777});
					this.log("components.json - Updated!");

					// Remove import reference to main.scss
						let lr = new readline('src/styles/main.scss');
						let lines = [];
					lr.on('line', function (line) {
						if (line.indexOf(args.name + ".anatomy-component.scss") < 0){
							lines.push(line);
						}
					});
					lr.on('end', function () {
						fs.writeFile("src/styles/main.scss", lines.join("\n"), function(err) {
								self.log("src/styles/main.scss - Updated!");
						}); 
					});


				}
			}

			
			cb();

		} catch (e) {
			self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
		}
});






vorpal.command('list-components', "List all components")
	.alias("lc")
	.action(function(args, cb){
		try {

			// Remove from component JSON file
			let comp_list = JSON.parse(shell.cat('components.json').stdout);
			for(i in comp_list) { 
				this.log( chalk.bold(i));
				this.log( " ~  JS Script: " + comp_list[i]["js"]);
				this.log( " ~  SASS Script: " + comp_list[i]["sass"]);
				this.log( " ~  Created At Date: " + comp_list[i]["created_at"] + "\n");
			} 

			
			cb();

		} catch (e) {
			self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
		}
});






vorpal.command('back', "Move current directory backwards.")
	.alias("..")
	.action(function(args, cb){
		try {

			process.chdir('../');
			vorpal.delimiter(pkg_config.name + "@" + pkg_config.version + " [" + path.resolve(process.cwd()) + "] >> " );

			cb();

		} catch (e) {
			self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
		}
});






vorpal.command('use <path>', "Move current directory forwards to path.")
	.alias("cd")
	.action(function(args, cb){
		try {

			process.chdir(args.path);
			vorpal.delimiter(pkg_config.name + "@" + pkg_config.version + " [" + path.resolve(process.cwd()) + "] >> " );

			cb();

		} catch (e) {
			self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
		}
});






// vorpal.command('build', "Build "+pkg_config.name + "compilable files")
// 	.alias("x")
// 	.action(function(args, cb){
	// try {

// 		let self = this;

// 		var exec = require('child_process').exec;
// 		var child = exec( path.resolve(process.cwd()) +"/node_modules/.bin/grunt --gruntfile "+ path.resolve(process.cwd()) +"/Gruntfile.js", function (error, stdout, stderr) {
// 			self.log( chalk.inverse('Grunt Outputs: ' + stdout) );
// 			self.log( chalk.inverse('Grunt Errors: ' + stderr) );
// 			if (error !== null) {
// 				self.log( chalk.inverse('Exec. Errors: ' + error) );
// 			}
// 		});

// 		
// cb();
// 	} catch (e) {
// 		self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
// 	}
// });






// vorpal.command('watch', "Watch "+pkg_config.name + "compilable files")
// 	.alias("w")
// 	.action(function(args, cb){
	// try {

// 		let self = this;

// 		var exec = require('child_process').exec;
// 		var child = exec( path.resolve(process.cwd()) +"/node_modules/.bin/grunt watch", function (error, stdout, stderr) {
// 			self.log( chalk.inverse('Grunt Outputs: ' + stdout) );
// 			self.log( chalk.inverse('Grunt Errors: ' + stderr) );
// 			if (error !== null) {
// 				self.log( chalk.inverse('Exec. Errors: ' + error) );
// 			}
// 		});

// 		
// cb();
// 	} catch (e) {
// 		self.log(chalk.red(chalk.bold("Runtime Error: ") + e));
	// }
// });





vorpal
	.delimiter(pkg_config.name + "@" + pkg_config.version + " [" + path.resolve(process.cwd()) + "] >> " )
	.show();