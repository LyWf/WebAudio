(function() {

        var app = require('http').createServer(handler);
        var io = require('socket.io').listen(app);

        var clients = [];

        var color = {
                red   : '\033[31m',
                blue  : '\033[34m',
                brightBlue : '\033[34;1m',
                brightBlack : '\033[30;1m',
                brightGreen : '\033[32;1m',
                brightMagenta: '\033[35;1m',
                reset : '\033[0m'
        };

        console.debug = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(color.brightBlack + 'DEBUG' + color.reset);
                try {
                        return this.log.apply(this, args);
                } catch(e) {};
        };

        function handler(request, response) {

        };
        app.listen(8081);

        io.configure(function() {
                //io.set('origins', ['hrlive.ru:*','www.hrlive.ru:*']);
                io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
                // Production
                //io.set('log level', 1);
                /*io.enable('browser client minification');
                io.enable('browser client etag');
                io.enable('browser client gzip');*/
        });

        io.sockets.on('connection', function(socket) {

                clients[socket.id] = {
                        socket: socket,
                        subscribers: []
                };
                console.info(color.brightBlue + 'Connected' + color.reset);
                console.log(socket.id);

                socket.on('init', function(data) {
                        socket.emit('init', {id: socket.id});
                });

                socket.on('subscribe', function(data) {
                        if(data.id) {
                                socket.join(data.id + '_room');
                        };
                });
                socket.on('unsubscribe', function(data) {
                        if(data.id) {
                                var rooms = io.sockets.manager.roomClients[socket.id];
                                if(rooms['/' + data.id + '_room'])
                                        socket.leave(data.id + '_room');
                        };
                });

                socket.on('file', function(data) {
                    //console.log(data);
                    socket.broadcast.to(socket.id + '_room').emit('file', data);
                });
				socket.on('fileInfo', function(data) {
					socket.broadcast.to(socket.id + '_room').emit('fileInfo', data);
				});

                socket.on('disconnect', function() {
                        delete clients[socket.id];
                });

        });

})();
