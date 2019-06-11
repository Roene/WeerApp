var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var request = require('request-promise')
var mongoose = require('mongoose')

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
	.use(express.static('static'))
	.use(bodyParser.urlencoded({extended: true}))
	.use(session({
		resave: false,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET
	}))

	.set('view engine', 'ejs')
	.set('views', 'view')

	.get('/', function(req, res) {
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

  	.post('/', function(req, res) {
  		var newCity = new cityModel({name: req.body.city_name})
  		newCity.save()
  		.then(result => {
  			res.redirect('/')
  		}).catch(err =>{
  			console.log(err)
  			res.render('error', err)
  		})
  	})

  	.listen(4000)
  