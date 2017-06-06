var config      = require('./js/json/config_server.json'),
    RedisServer = require('redis-server'),
    RedisClient = require('./js/utils/RedisClient'),
    redis 		= require('redis'),
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

//zapneme server
server.open().then(() => {
    //vytvorime klienta
    client = new RedisClient.Redis(redis, config, function(){
        //resetujeme data
        client.reset(function(){
            //odpojime klienta
            client.disconnect();

            //zavrieme server
            server.close().then(() => {
                console.log("Inštalácia bola úspešne dokončená");
            });
        });
    });

    //
    //eval(fs.readFileSync('server.js')+'');
});