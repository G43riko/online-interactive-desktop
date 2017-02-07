# Online interaktívna plocha

##Features
- Drawing
- Load/Save project
- Create objects(rectangle, ellipse, line, polygon, table)
- Edit created objects
- Support layers
- Shared drawing
- Drawing analytics

##Development
OIP uses varius tools for development
- [JQuery](https://jquery.com/)
- [NodeJS](https://nodejs.org/)
- [SocketIO](http://socket.io/)
- [Grunt](http://gruntjs.com/)
 - [concat](https://www.npmjs.com/package/grunt-contrib-concat)
 - [watch](https://www.npmjs.com/package/grunt-contrib-watch)
 - [sass](https://www.npmjs.com/package/grunt-sass)
 - [babel](https://www.npmjs.com/package/grunt-babel)
 - [jshint](https://www.npmjs.com/package/grunt-contrib-jshint)
 - [uglify](https://www.npmjs.com/package/grunt-contrib-uglify)
 - [shell](https://www.npmjs.com/package/grunt-shell)
 
##Requirements
- [Redis](https://redis.io/)
- [NodeJS](https://nodejs.org/)

##Configuration
__server__
- app.port
- redis.url
- redis.port
- maximum.user
- maximum.lessons
- maximum.backup_time

__client__
- url.anonym_data
- project.author
- project.layer_title
- project.name
