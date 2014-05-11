// Helpers etc.
var DETAIL = 1024;

var removePreloader = function() {
	document.querySelector(".preloader").remove();
}

var AudioContext = AudioContext || webkitAudioContext;

// Actual audio API code
var source, buffer, analyser;

var context = new AudioContext();
var request = new XMLHttpRequest();
request.open( 'GET', 'sound.mp3', true );
request.responseType = 'arraybuffer';

// Canvas
var canvas = document.getElementById( "readout" );
var ctx = canvas.getContext( "2d" );

var updateCanvasSize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.addEventListener( "resize", updateCanvasSize );
updateCanvasSize();

function playSound() {
	// buffer source has to be recreated for every "play"
	source = context.createBufferSource( 2, 176400, 176400 );
	source.buffer = buffer;
	source.connect( context.destination );

	source.start(0);
	removePreloader();
}

function createSoundAnalyser() {
	analyser = context.createAnalyser();
	analyser.fftSize = DETAIL;
	analyser.smoothingTimeConstant = 0.8;

	source.connect( analyser );
	analyser.connect( context.destination );
}

function loop() {
	var freqDomain = new Uint8Array( analyser.frequencyBinCount );
	analyser.getByteFrequencyData( freqDomain );
	// console.log(freqDomain);

	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	ctx.fillStyle = "#00ccff";

	var barWidth = Math.round(canvas.width / analyser.frequencyBinCount);

	for (var i = 0; i < analyser.frequencyBinCount; i++) {
		var percent = freqDomain[i] / 256; // Not sure what 256 is yet, but it doesn't change when we change DETAIL...
		var barHeight = canvas.height * percent;
		ctx.fillRect( i * barWidth, canvas.height, barWidth, barHeight * -1 );
	};



	requestAnimationFrame(loop);
}

request.onload = function() {
	context.decodeAudioData(request.response, function( b ) {
		buffer = b;
		playSound();
		createSoundAnalyser();
		loop();
	}, function() {
		alert( 'Error decoding audio file' );
	});

};
request.send();