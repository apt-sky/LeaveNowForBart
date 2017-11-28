var time = 10; /* how long the timer runs for */
var initialOffset = '440';
var i = 1
var interval = setInterval(function() {
    $('.circle_animation').css('stroke-dashoffset', initialOffset-(i*(initialOffset/time)));
    $('h2').text(i);
    if (i == time) {
        clearInterval(interval);
    }
    i++;  
}, 1000);