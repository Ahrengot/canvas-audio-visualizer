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
	source = context.createBufferSource();
	source.buffer = buffer;
	source.connect( context.destination );

	source.start(0);
	removePreloader();
}

function createSoundAnalyser() {
	analyser = context.createAnalyser();
	analyser.fftSize = DETAIL;
	analyser.smoothingTimeConstant = 0.9;

	source.connect( analyser );
	analyser.connect( context.destination );
}

function loop() {
	var freqDomain = new Uint8Array( analyser.frequencyBinCount );
	analyser.getByteTimeDomainData( freqDomain );
	// console.log(freqDomain);

	ctx.fillStyle = "rgba(0,0,0,0.03)";
	var hue = Math.sin( analyser.context.currentTime * 0.05 ) * 360;
	ctx.strokeStyle = "hsla(" + hue + ", 80%, 50%, 0.8)";
	// ctx.setLineDash([2, 2]);
	ctx.lineWidth = 2;


	// ctx.clearRect( 0, 0, canvas.width, canvas.height );
	ctx.fillRect( 0, 0, canvas.width, canvas.height );

	ctx.beginPath();
	ctx.moveTo( 0, Math.round( canvas.height / 2 ) );

	var barWidth = Math.round(canvas.width / analyser.frequencyBinCount);

	for (var i = 0; i < ( analyser.frequencyBinCount - 1 ); i++) {
		// Not sure what 256 is yet, but it doesn't change when we change DETAIL...
		// wait ... maybe it has to do with Uint8 in the array. 0-256... hmm...
		var percent = freqDomain[i] / 256;
		var barHeight = canvas.height * percent;

		ctx.lineTo( (i + 1) * barWidth, barHeight );
		// ctx.fillRect( i * barWidth, canvas.height, barWidth, barHeight * -1 );
	};
	ctx.lineTo( canvas.width, Math.round( canvas.height / 2 ) );

	ctx.stroke();
	ctx.closePath();

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