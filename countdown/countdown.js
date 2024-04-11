// Grab parameters
const urlParams = new URLSearchParams(window.location.search);

var colorRegex = /\d+,\d+,\d+,\d+/;
var sizeRegex = /\d+/;

// Check if font color parameter is set and valid
var fontColor = '255,255,255,1';
if (urlParams.has('c') == true && colorRegex.test(urlParams.get('c')) == true){
    fontColor = urlParams.get('c');
    console.log('Font color set to ' + fontColor);
}

// Check if background color parameter is set and valid
var backgroundColor = '0,0,0,0';
if (urlParams.has('bgc') == true && colorRegex.test(urlParams.get('bgc')) == true){
    backgroundColor = urlParams.get('bgc');
    console.log('Background color set to ' + backgroundColor);
}

// Check if font size parameter is set and valid
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

    var timeString ="";
    if (hrs >= 1)  { timeString += hrs + ':'; }
    if (secs < 10) { secs = '0' + secs}
    timeString += mins + ':' + secs;
    return timeString;
}

// Make sure the time parameter is set and valid
if (urlParams.has('t') == false || sizeRegex.test(urlParams.get('t')) == false){
    document.getElementById("mainDisplay").innerHTML = '';
} else {
    // Set the number of milliseconds we are counting down to
    var t = urlParams.get('t');
    var countDownDate = new Date().getTime();
    countDownDate += t*1000;

    // Every second update the display
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var html = "";
        if (distance < 0) {
            html += '<div style="font-size: ' + fontSize + 'px; font-weight: bold; width: fit-content; height: fit-content; margin: auto; padding: 5px 20px 5px 20px; background-color: rgba(' + backgroundColor + '); border-radius: 25px;">';
            html += '<div class="timesUp">0:00</div>';
            html += '</div>'
            // Play alarm sound effect
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
            // Clear the display after 5 seconds, enough time for the alarm to finish.
            setTimeout(function(){document.getElementById("mainDisplay").innerHTML = '';}, 5000);
            clearInterval(x);
        } else {
            html += '<div style="font-size: ' + fontSize + 'px; color: rgba(' + fontColor + '); font-weight: bold; width: fit-content; height: fit-content; margin: auto; padding: 5px 20px 5px 20px; background-color: rgba(' + backgroundColor + '); border-radius: 25px;">';
            html += msToTime(distance);
            html += '</div>'
        }
        document.getElementById("mainDisplay").innerHTML = html;
    }, 500);
}

//color: #281d37; background-color: rgba(232, 124, 192, 0.4)
