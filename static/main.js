// KLOK VOOR DE APPLICATIE
function checkTime(i) {
  if (i < 10) {
    i = '0' + i
  }
  return i
}

function startTime() {
  var today = new Date()
  var hours = today.getHours()
  var minutes = today.getMinutes()
  var seconds = today.getSeconds()

  minutes = checkTime(minutes)
  seconds = checkTime(seconds)
  document.getElementById('clock').innerHTML = hours + ":" + minutes + ":" + seconds
  time = setTimeout(function() {
    startTime()
  }, 500)
}

startTime()

//AJAX CALL IN DE FOOTER
var myRequest = new XMLHttpRequest()
myRequest.open('GET', 'roene.html')
myRequest.onreadystatechange = function () { 
    if (myRequest.readyState === 4) {
        document.getElementById('changeText').innerHTML = myRequest.responseText
    }
}

function sendTheAJAX() {
    myRequest.send()
    document.getElementById('change').style.display = 'none'
}

var socket = io.connect('http://localhost:4000'); //connect to server
var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
    labels: [],
    datasets: [{
        label: "Temperature",
        borderColor: "#FF5733",
        data: [],
        fill: false,
        pointStyle: 'circle',
        backgroundColor: '#3498DB',
        pointRadius: 5,
        pointHoverRadius: 7,
        lineTension: 0,
    }]
    },
    // Configuration options go here
    options: {}
    
});
socket.on('data', function(data) { //As a temp data is received 
    console.log(data.data)
    document.getElementById('date').innerHTML = data.date //update the date
    if(chart.data.labels.length != 15) { //If we have less than 15 data points in the graph
        chart.data.labels.push(data.time) //Add time in x-asix
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data.data) //Add temp in y-axis
        });
    }
    else { //If there are already 15 data points in the graph.
        chart.data.labels.shift() //Remove first time data
        chart.data.labels.push(data.time) //Insert latest time data
        chart.data.datasets.forEach((dataset) => {
            dataset.data.shift() //Remove first temp data
            dataset.data.push(data.data) //Insert latest temp data
        });
    }
    chart.update() //Update the graph.
})