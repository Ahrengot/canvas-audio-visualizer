// Integer between 32-2048. Change this to modify the defail of the graph.
var DETAIL = 256;

// Path to the mp3 file we want to play
var SOUNDFILE = "sound.mp3"

// Audio API vars
var AudioContext = AudioContext || webkitAudioContext;
var source, buffer, analyser;
var context = new AudioContext();

// Canvas
var canvas = document.getElementById( "readout" );
var ctx = canvas.getContext( "2d" );

function createBuffer() {
	source = context.createBufferSource();
	source.buffer = buffer;
	source.connect( context.destination );

	document.querySelector(".preloader").remove();
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
		// ... maybe it has to do with Uint8 in the array. Maybe values in Uint8 array only
		// exist between 0-256... hmm...
		var percent = freqDomain[i] / 256;
		var barHeight = canvas.height * percent;

		ctx.lineTo( (i + 1) * barWidth, barHeight );
	};
	ctx.lineTo( canvas.width, Math.round( canvas.height / 2 ) );

	ctx.stroke();
	ctx.closePath();

	requestAnimationFrame(loop);
}

function handleSoundLoaded() {
	var playBtn = document.querySelector( "button.play" );
	playBtn.style.display = "block";

	createBuffer();
	createSoundAnalyser();

	// iOS won't let us play media without a user interaction. Guessing it's the same for Android,
	// so add a button for touch screens.
	if ( 'ontouchstart' in document.documentElement ) {
		playBtn.addEventListener("click", function(e) {
			this.remove();
			source.start(0);
			loop();
		});
	// For desktop, we just autoplay.
	} else {
		playBtn.remove();
		source.start(0);
		loop();
	}
}

// Prep an AJAX request for the sound file
var request = new XMLHttpRequest();
request.open( 'GET', SOUNDFILE, true );
request.responseType = 'arraybuffer';
request.onload = function() {
	context.decodeAudioData(request.response, function( b ) {
		buffer = b;
		handleSoundLoaded();
	}, function() {
		alert( 'Error decoding audio file' );
	});

};
request.send();

// Handle window resize
var updateCanvasSize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
window.addEventListener( "resize", updateCanvasSize );
updateCanvasSize();