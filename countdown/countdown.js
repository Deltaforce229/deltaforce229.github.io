// Grab parameters
const urlParams = new URLSearchParams(window.location.search);

var colorRegex = /\d+,\d+,\d+,\d+/;
var sizeRegex = /\d+/;

var fontColor = '255,255,255,1';
if (urlParams.has('c') == true && colorRegex.test(urlParams.get('c')) == true){
    fontColor = urlParams.get('c');
    console.log('Font color set to ' + fontColor);
}

var backgroundColor = '0,0,0,0';
if (urlParams.has('bgc') == true && colorRegex.test(urlParams.get('bgc')) == true){
    backgroundColor = urlParams.get('bgc');
    console.log('Background color set to ' + backgroundColor);
}

var fontSize = '40';
if (urlParams.has('s') == true && sizeRegex.test(urlParams.get('s')) == true){
    fontSize = urlParams.get('s');
    console.log('Font size set to ' + fontSize);
}

// Convert milliseconds to a readable time
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  if (hrs < 1)  {
    //if (secs < 10){
    //    return secs + ':' + ms;
    //}
    return mins + ':' + secs;
  }
  return hrs + ':' + mins + ':' + secs;
}

// Make sure t is set
if (urlParams.has('t') == false){
    document.getElementById("mainDisplay").innerHTML = '<div style="font-size: 40px; font-weight: bold; width: fit-content; height: fit-content; margin: auto;">NO TIME SET</div>';
} else {
    // Set the number of milliseconds we are counting down to
    var t = urlParams.get('t');
    var countDownDate = new Date().getTime();
    countDownDate += t*1000;

    var html = "";
    var x = setInterval(function() {

      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // If the count down is finished, write some text

      if (distance < 0) {
        var url = 'https://deltaforce229.github.io/countdown/alarm.wav';
        window.AudioContext = window.AudioContext||window.webkitAudioContext; //fix up prefixing
        var context = new AudioContext(); //context
        var source = context.createBufferSource(); //source node
        source.connect(context.destination); //connect source to speakers so we can hear it
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer'; //the  response is an array of bits
        request.onload = function() {
            context.decodeAudioData(request.response, function(response) {
                source.buffer = response;
                source.start(0); //play audio immediately
                source.loop = false;
            }, function () { console.error('The request failed.'); } );
        }
        request.send();
        clearInterval(x);
      } else {
        html += '<div style="font-size: ' + fontSize + 'px; color: rgba(' + fontColor + '); font-weight: bold; width: fit-content; height: fit-content; margin: auto; padding: 5px 20px 5px 20px; background-color: rgba(' + backgroundColor + '); border-radius: 25px;">';
        html += msToTime(distance);
        html += '</div>'
      }
      document.getElementById("mainDisplay").innerHTML = html;
      html = "";
    }, 10);
}

//color: #281d37; background-color: rgba(232, 124, 192, 0.4)
