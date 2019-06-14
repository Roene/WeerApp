var express = require('express')
var app = require('express')()
var server = require('http').createServer(app)
var session = require('express-session')
var bodyParser = require('body-parser')
var request = require('request-promise')
var mongoose = require('mongoose')
var io = require('socket.io').listen(server)
var SerialPort = require('serialport')

var port = new SerialPort('/dev/ttyS3', {baudRate: 9600}, function (err) {
	if (err) {
		return console.log('Error: ', err.message)
	}
})

var Readline = SerialPort.parsers.Readline;
var parser = port.pipe(new Readline({delimiter: '\r\n'}))

parser.on('data', (data) => { //Read data
    console.log(data);
    var today = new Date();
    io.sockets.emit('data', {date: today.getDate()+"-"+today.getMonth()+1+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), data:data})
});

io.on('connection', (socket) => {
    console.log("Someone connected.");
})

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

var citySchema = new mongoose.Schema({
	name: String
})

var cityModel = mongoose.model('City', citySchema)

async function collectWeather(cities) {
	var weatherData = []
	for (var city_object of cities) {
		var city = city_object.name
		var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=ef28c61a2416a123137107cf00536b5b`
		request(url)
		var body = await request(url)
		var weatherJSON = JSON.parse(body)
		var weather = {
		city: city,
		temperature: Math.round(weatherJSON.main.temp),
		description: weatherJSON.weather[0].description,
		icon: weatherJSON.weather[0].icon,
		}
		weatherData.push(weather)
	}
	return weatherData
}

express()
	app.use(express.static('static'))
	app.use(bodyParser.urlencoded({extended: true}))
	app.use(session({
		resave: false,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET
	}))

	app.set('view engine', 'ejs')
	app.set('views', 'view')

	app.get('/', function(req, res) {
		cityModel.find({}, function(err, cities) {
			collectWeather(cities).then(function(result) {
				var weatherData = {weatherData: result}
				res.render('index', weatherData)
			}).catch(err => {
				console.log(err)
				res.render('error', err)
			})
		})
  	})

  	app.post('/', function(req, res) {
  		var newCity = new cityModel({name: req.body.city_name})
  		newCity.save()
  		.then(result => {
  			res.redirect('/')
  		}).catch(err =>{
  			console.log(err)
  			res.render('error', err)
  		})
  	})

  	app.get('/sensor', function(req,res) {
  		res.render('sensor')
  	})

  	server.listen('4000', () => {
  		console.log('Server listening on Port 4000');
	})
  