module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['src/components/*.js'],
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
					'dist/<%= pkg.name %>.css': 'src/styles/main.scss'
				}
			}
		},
		concat: {
			build: {
				src: 'src/**/*.js',
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');


	grunt.registerTask('build-js', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('build-sass', ['sass']);
	grunt.registerTask('watch', ['jshint', 'sass', 'concat', 'uglify', 'watch']);
	grunt.registerTask('default', ['jshint', 'sass', 'concat', 'uglify']);
};