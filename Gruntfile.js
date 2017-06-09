module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['gruntfile.js', 'src/components/*.js'],
			options: {
				asi: true,
				sub: true
			}
		},
		sass: {
			dist: {
				options: {
						style: 'compressed'
				},
				files: {
					'bin/<%= pkg.name %>.css': 'src/styles/main.scss'
				}
			}
		},
		concat: {
			build: {
				src: 'src/**/*.js',
				dest: 'bin/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'bin/<%= pkg.name %>.js',
				dest: 'bin/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			js: {
				files: ['src/components/*.js'],
				tasks: ['jshint', 'concat', 'uglify']
			},
			css: {
				files: ['src/styles/*.scss'],
				tasks: ['sass']
			}
		},
		copy: {
			ractive: {
				files: [
					{ src: 'node_modules/ractive/ractive.min.js', dest: 'bin/' },
					{ src: 'node_modules/ractive/ractive.min.js', dest: 'bin/' }
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');


	grunt.registerTask('build-js', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('build-sass', ['sass']);
	grunt.registerTask('watch', ['jshint', 'sass', 'concat', 'uglify', 'watch']);
	grunt.registerTask('default', ['jshint', 'sass', 'concat', 'uglify']);
};