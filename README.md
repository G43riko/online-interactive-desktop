# Online interaktívna plocha

##Features
- Drawing
- Load/Save project
- Create objects(rectangle, ellipse, line, polygon, table)
- Edit created objects
- Support layers
- Create 

##Development
OIP uses varius tools for development
- JQuery
- NodeJS 
- SocketIO
- Grunt
 - concat
 - watch
 - sass
 - babel
 - uglify
 - shell
 
##Requirements
- Redis database
- NodeJS

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
