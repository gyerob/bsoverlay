let progressbar = document.getElementById("hpprogressbar");

function updateProgressBar(value) {
	if (value >= 0 && value <= 100) {
		progressbar.style.width = value + "%"; 
	}
}

function handleInput() {
	console.log("hello")
	let value = document.getElementById('set-value').value;
	if (value > 100) {
		value = 100;
		document.getElementById('set-value').value = 100;
	}
	if (value < 0) {
		value = 0;
		document.getElementById('set-value').value = 0;
	}	  
	updateProgressBar(value);
}