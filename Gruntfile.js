//TODO rozdeliť skripty na frontend a backend
//TODO počúvať backend scripty a pri zmene reštartovať server

module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var files = {
		js : {
			source : [
					"components/LayersViewer.js",
					"components/ContextMenu.js",
					"js/utils/logger.js",
					"js/lib/alerts.js",
					"js/config.js",
					"js/components/Analyzer.js",
					"js/components/creator.js",
					"js/components/guiManager.js",
					//"js/components/panelManager.js",
					"js/components/colorManager.js",
					"js/utils/GVector2f.js",
					"js/utils/utils.js",
					"js/components/menu.js",
					//"js/components/slider.js",
					//"js/components/chatViewer.js",
					"js/components/contextMenu.js",
					"js/components/fileManager.js",
					"js/components/optionManager.js",
					"js/components/input.js",
					"js/components/canvasManager.js",
					"js/utils/canvasHandler.js",
					"js/components/contentManager.js",
					"js/components/selectedObjects.js",
					"js/components/layer.js",
					"js/components/scene.js",
					"js/components/eventManager.js",
					//"js/components/timeLine.js",
					"js/components/ConnectionManager.js",
					"js/components/projectManager.js",
					"js/components/paintManager.js",
					"js/listeners.js",
					"js/main.js",
					"js/objects/entity.js",
					"js/components/creatorViewer.js",
					"js/objects/text.js",
					"js/objects/table.js",
					"js/objects/class.js",
					"js/objects/polygon.js",
					"js/objects/join.js",
					"js/objects/rect.js",
					"js/objects/paint.js",
					"js/objects/line.js",
					"js/objects/arc.js",
					"js/objects/area.js",
					"js/objects/graph.js",
					"js/objects/imageObject.js",
					"js/objects/textArea.js",
					"js/objects/arrow.js",
					"js/utils/test.js",
					"js/components/sharer.js",
					"js/components/taskManager.js",
					"js/components/formManager.js"
				],
			final : 'build/scripts.min.js'
		},
		css : {
			source : ["css/Components.css","css/Styles.css"],
			final : 'build/styles.css'
		},
		sass : {
			source : ["components/Components.scss", "css/**/*.scss"],
			final : ['css/Components.css', "css/Styles.scss"]
		}
	}

	var message = grunt.option("message") || "Drobné úpravy a fixy"

	grunt.initConfig({
		concat : {
			js : {
				src: files.js.source,
				dest: files.js.final
			},
			css : {
				src: files.css.source,
				dest: files.css.final
			}
		},
		watch: {
				js : {
					files : ["js/**/*.js", "components/**/*.js"],
					tasks : ["concat:js"]
				},
				sass : {
					files : files.sass.source,
					tasks : ["sass"]//netreba volať concat lebo sa zavola watch kvoli zmene css suboru
				},
				css : {
					files : files.css.source,
					tasks : ["concat:css"]
				},
				//TODO server files
				/*
				server : {
					files : [],
					tasks : ["shell:restartServer:kill", "updateBackend", "shell:restartServer"]
				}
				*/
		},
		sass: {
			options: {
				sourceMap: false
			},
			dist: {
				files: {
					'css/Components.css': 'components/Components.scss',
					'css/Styles.css': 'css/styles.scss',
				}
			}
		},
		babel: {
			options: {
				sourceMap: false,
				presets: ['babel-preset-es2015']
			},
			dist: {
				files: {
					'build/scripts.min.js': files.js.final
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					'build/scripts.min.js': [files.js.final]
				}
			}
		},
		shell: {
		    restartServer : {
				command: [
	                'killall nodejs',
	                'nodejs /var/www/html/plocha/server.js'
	            ].join(';'),
	            options: {
	            	async: true
	            }
		    },
		    deploy : {
		    	command : [
		    		//msg => 'echo ' + msg
		    		"git add --all",
		    		"git commit -m \"" + message + "\"",
		    		"git push"
		    	].join(";"),
		    	options : {

		    	}
		    }
		},
		jshint: {
			options: {
				curly: true, //aj 1 riadok musí byť ozatvorkovany
				eqeqeq: true, //2 = vs 3 =
				eqnull: true, 
				browser: true,
				esversion: 6, //ES6
				sub: true, // obj["aa"] vs obj.aa
				maxparams: 7, //maximum parametrov vo funkcii
				maxstatements : 30, //maximum statementov vo funkcii
				globals: {
					jQuery: true
				},
			},
			//uses_defaults: ['components/LayersViewer.js']
			uses_defaults: ['js/G.js']
			//uses_defaults: '<%= concat.js.src %>'
			
		}
	});


	//TODO remove unused CSS
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-shell-spawn');
	grunt.registerTask('deploy', ["shell:deploy"]);
	grunt.registerTask('default', ["sass", "concat", "watch"]);
	grunt.registerTask('build', ["sass","concat", "babel", "uglify"]);
	grunt.registerTask('runAndWork', ["shell:restartServer", "default", "shell:restartServer:kill"]);
	grunt.registerTask('args',function(){
		console.log(arguments.length);
		console.log(arguments[0])
		console.log(arguments[1])
	})
}