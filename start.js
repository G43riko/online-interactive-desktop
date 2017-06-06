/**
 * Created by gabriel on 22.4.2017.
 */
var config      = require('./js/json/config_server.json'),
    RedisServer = require('redis-server'),
    data        = {},
    fs          = require('fs');

if(config.redis){
    if(config.redis.port){
        data.port = config.redis.port;
    }
    if(config.redis.conf){
        data.conf = config.redis.conf;
    }
    if(config.redis.bin){
        data.bin = config.redis.bin;
    }
    server = new RedisServer(data);
}
else{
    server = new RedisServer(6379);
}
server.open((err) => {
    if (err === null) {
        console.log("redis bol uspesne spusteny");
        eval(fs.readFileSync('server.js') + '');
    }
    else{
        console.log("server sa nepodarilo otvorit z dovodu: ", err);
        if(err.code && err.code === -1){
            console.log("skusam spustit aplikaciu pre pripad ze redis uz bezi");
            eval(fs.readFileSync('server.js') + '');
        }
    }
});
/*
server.close((err) => {
    if (err === null) {
        console.log("redis bol uspesne ukonceny");
    }
    else{
        console.log("redis sa nepodarilo ukoncit");
    }
});
*/
/*
server.open().then(() => {
    eval(fs.readFileSync('server.js') + '');
});
    */