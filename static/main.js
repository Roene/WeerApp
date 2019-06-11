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