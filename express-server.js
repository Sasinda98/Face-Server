const express = require('express');
const bodyParser = require('body-parser');
//you need middleware to read the request, or else you'll get undefined output
 
const app = express();

//middleware
app.use(bodyParser.urlencoded({extended: false}));//support reading body in post

app.use(bodyParser.json());		//support json request

app.use((req,res,next)=>{
	console.log("HELlOOOOOOO");
	next(); 	//to continue execution.. or else wont go past this point.
});

app.get('/', (req, res)=>{
	const user = { name: 'Gayal'};
	//res.send(user);
});

app.post('/profile', (req, res)=>{
	console.log(req.body);
});

app.listen(3000);

//as