const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');	//by pass origin error from chrome console
//you need middleware to read the request, or else you'll get undefined output
 
const Clarifai = require('clarifai');

 //builds sql queries
 const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'sasinda',
    database : 'smartbrain'
  }
});


const clarifai_app = new Clarifai.App({
 apiKey: '2009c3c5b635434c9efb71d0d01712b1'
});

//for hashing passwords.
const bcrypt = require('bcrypt-nodejs');


const app = express();

//how to query...
//db.select().table('users').then(data=>console.log(data));


//middleware
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));//support reading body in post

app.use(bodyParser.json());		//support json request



app.use((req,res,next)=>{
	//console.log("REQUEST MADE");
	next(); 	//to continue execution.. or else wont go past this point.
});


app.get('/', (req, res)=>{
	res.json({name:'gayal', pass:'pass'});
	
});


app.post('/signin', (req, res)=>{
	const {email, password} = req.body;
	console.log('data from request :', req.body);
	//db.select().table('users').then(item=>console.log(item));

	const response = {loginStatus: '', ident:''};

	const status = checkCredentials(email, password)
	.then(status=>{
		console.log(status);
		if( ( status.isEmailMatched === true ) && ( status.isPasswordMatched === true ) ){
			response.loginStatus = 'successful';
			response.ident = status.id;
			res.json(response);
		}else if( status.error === true ){
			response.loginStatus = 'error occured while authenticating...';
			response.ident = 0;
			res.json(response);
		} else{
			response.loginStatus = 'failed';
			response.ident = 0;
			res.json(response);
		}
	});
	
});

async function checkCredentials(email, password) {

	const credentials = { id: '', isEmailMatched : false, isPasswordMatched: false, error: false, errorMessage: '' };
	try {
		const usersQuery = await db('users').where({email: email});
		const userDetails = await usersQuery;		//array return

		const loginQuery = await db('login').where({email: email});
		const loginDetails = await loginQuery;


		if(userDetails.length > 0){
			credentials.isEmailMatched = true;
			credentials.id = userDetails[0].id;
			console.log('credentials===============', credentials.id);
		}
		if(loginDetails.length > 0){
			const passwordDB = loginDetails[0].hash;
		/*const crypto = await bcrypt.compare('dirty', '$2a$10$1i3E13CI0N.ex7gZHQdlN.sZJzG/a3XMfadVsWdMwkkp35LsR2xhm', function(err, res) {
	    		console.log('<<<<<<<CRYPTO RUN>>>>>>>');	
	    		// res == true
	    		if(res===true){
	    			credentials.isPasswordMatched = true;	
	    			console.log('<<<<<<<CRYPTO Success>>>>>>>');	
	    		}
				
			});*/
			const isMatched = bcrypt.compareSync(password, passwordDB);	
			if(isMatched){
				credentials.isPasswordMatched = true;
			}
		}
	} catch(e) {
		console.log(e);
		credentials.error = true;
		credentials.errorMessage = e;
	}
	
	//console.log('credentials: ', credentials);
	return credentials;
}

//sign up
app.post('/signup', (req, res)=>{
	//getting form data
	const {email, name, password} = req.body; 	//es6 destructuring
	
	console.log('request : ', req.body);

	//inserting through knex
	db('users')
	.returning('*')	//setting to enable return of added user.
	.insert({name: name, email: email})
	.then(user=>{
			console.log('added user:', user);
			addLogin(email, password, res);	
				})
	.catch(error=>res.status(400).json("error occured, unable to register"));

	

});

function addLogin(email, password, res){
	bcrypt.hash(password, null, null, function(err, hash) {
	    // Store hash in your password DB.
		//inserting record to login table
		db('login')
		.returning('*')	//setting to enable return of added user.
		.insert({email: email, hash: hash})
		.then(user=>res.json("user added"))
		.catch(error=>res.status(400).json("error occured, unable to register"));
	});
}

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	console.log('PARAMS = ', req.params)

	db('users')
	.where({
  		id: id
	})
	.select('name', 'entries')
	.then(user=>res.json(user[0]))
	.catch(error=> res.status(400).json());
});

app.put('/image/submit/:id', (req, res)=>{
	const id = req.params.id;

	db('users')
	  .where('id', '=', id)
	  .increment('entries', 1)
	  .then(result=>res.json(result))
	  .catch(error=>res.json('error occured'));
});

app.post('/image/process', (req, res) => {
	const imageUrl = req.body.url;

	if( imageUrl.length > 0){

      let results = clarifai_app.models.predict("a403429f2ddf4b49b307e318f00e528b", imageUrl)
      .then(
	      function(response) {
	   
	      let regionArray = response.outputs[0].data.regions;

	      res.json(regionArray);

	     },
	      function(err) {
	        // there was an error
	        res.json('error occured');
	      }
       )
      .catch(err=>{res.json('error occured')});
       
  	}

});

app.listen(3000, ()=>{console.log('SERVER STARTED..GSR');});

//as

/* PLAN--------------------------------------
	/ --> nothing
	/signin --> POST = success/fail
	/register --> POST = new user info.
	/profile/:userId --> GET = user
	/image --> PUT --> user.entries

*/