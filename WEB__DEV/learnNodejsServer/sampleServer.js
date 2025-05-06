var http = require('http');
var fs = require('fs');
var url = require('url');

http.createServer(server).listen(7000, function () {
    console.log("Server running at http://localhost:7000/");
});

function server(req, res) {
    var q = url.parse(req.url,true);
     
    if (q.pathname === '/') {
        fs.readFile('htmlserv.html', function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading homepage');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
        });
    } 
    else if (q.pathname === '/signup') {
        fs.readFile('singup.html', function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading signup page');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
        });
    } 
    else if (q.pathname === '/signupact') {
        console.log(q.query)
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('hello'+'<h2>'+q.query.name+'</h2>');
        res.end();
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('404 Not Found');
        res.end();
    }
}
