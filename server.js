const http = require('http');

const server = http.createServer( (req, res)=>{
	console.log('HEADERS: ', req.headers);
	console.log('METHOD: ',req.method);
	console.log('URL: ', req.url);

//To send html
	//res.setHeader('Content-Type', 'text/html');
	//res.end('<h1>Hello</h1>');

//to send json 
	const object = { name : 'Gayal Sasinda', favCar: 'Ferrari F12'};
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(object));


});

server.listen(3000);	//port number for listening