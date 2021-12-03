const query = new URLSearchParams(location.search);

function connect() {
	var ip = query.get("ip") || "localhost";
	var port = query.get("port") || 6557;	
	var port2 = query.get("port") || 2946;
	

	var socket = new WebSocket(`ws://${ip}:${port}/socket`);
	var dpsocket = new WebSocket(`ws://${ip}:${port2}/BSDataPuller/LiveData`);

	console.log("start logging in");

	socket.addEventListener("open", () => {
		console.log("WebSocket opened");
	});
	
	dpsocket.addEventListener("open", () => {
		console.log("WebSocket opened");
	});

	socket.addEventListener("message", (message) => {
		var data = JSON.parse(message.data);
		var event = events[data.event];

		if (event) {
			event(data.status, data.time);
		}
	});
	
	dpsocket.addEventListener("message", (message) => {
		var dpdata = JSON.parse(message.data);
		ui.hpbar(dpdata);
	});

	ui.show();

	socket.addEventListener("close", () => {
		console.log("Failed to connect, retrying");
		setTimeout(connect, 3000);
	});
	
	dpsocket.addEventListener("close", () => {
		console.log("Failed to connect, retrying");
		setTimeout(connect, 3000);
	});
}




const events = {
	hello(data, time) {
		console.log("Connected");
		if (data.beatmap && data.performance) {
			ui.beatmap(data.beatmap, time);
			ui.performance(data.performance);
			ui.show();
		}
	},

	songStart(data, time) {
		ui.beatmap(data.beatmap, time);
		ui.performance(data.performance);
		ui.show();
	},

	noteCut(data) {
		ui.performance(data.performance); 
	},
	
	noteFullyCut(data) {
		ui.performance(data.performance); 
	},
	
	obstacleEnter(data) {
		ui.performance(data.performance); 
	},
	
	obstacleExit(data) {
		ui.performance(data.performance); 
	},
	
	noteMissed(data) {
		ui.performance(data.performance); 
	},
	
	bombCut(data) {
		ui.performance(data.performance); 
	},

	pause(data, time) {
		ui.timer.pause(data.beatmap.paused + (Date.now() - time));
	},

	resume(data, time) {
		ui.timer.start(data.beatmap.start + (Date.now() - time), data.beatmap.length);
	},

	menu() {
		ui.timer.stop();
		ui.hide();
	}
}


const ui = (() => {
	var main = document.getElementById("overlay");

	const performance = (() => {
		var percentage = document.getElementById("percentage");
		var score = document.getElementById("score");
		var combo = document.getElementById("combo");
		var hit = document.getElementById("hit");
		var miss = document.getElementById("miss");
		var energy = document.getElementById("hpprogressbar");

		function format(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		return (data) => {
			score.innerText = format(data.score);
			combo.innerText = data.combo;
			percentage.innerText = (data.currentMaxScore > 0 ? (Math.floor((data.score / data.currentMaxScore) * 1000) / 10) : 0) + "%";
			miss.innerText = data.missedNotes;
			hit.innerText = data.hitNotes;
		}
	})();
	
	const hpbar = (() => {
		var energy = document.getElementById("hpprogressbar");

		return (data) => {
			energy.style.width = data.PlayerHealth + "%";
		}
	})();

	const timer = (() => {
		var timebar = document.getElementById("timeprogressbar");
		var timetext = document.getElementById("currenttime");

		var active = false;

		var began;
		var songduration;

		var display;	

		function format(time) {
			var minutes = Math.floor(time / 60);
			var seconds = time % 60;

			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return `${minutes}:${seconds}`;
		}		

		function update(time) {
			time = time || Date.now();

			var delta = time - began;

			var progress = Math.floor(delta / 1000);
			var songpercentage = Math.min(delta / songduration, 1);

			timebar.style.width = (songpercentage * 100) + "%";

			// Minor optimization
			if (progress != display) {
				display = progress;
				timetext.innerText = format(progress);
			}
		}

		function loop() {
			if (active) {
				update();
				requestAnimationFrame(loop);
			}
		}

		return {
			start(time, length) {
				active = true;
				
				began = time;
				songduration = length;

				loop();
			},

			pause(time) {
				active = false;

				update(time);
			},

			stop() {
				active = false;
				began = undefined;
				songduration = undefined;
			}
		}
	})();

	const beatmap = (() => {
		var cover = document.getElementById("image");
		var title = document.getElementById("title");
		var subtitle = document.getElementById("subtitle");
		var artist = document.getElementById("artist");
		var mapper = document.getElementById("mapper");
		var duration = document.getElementById("totaltime");
		
		function format(time) {
			var minutes = Math.floor(time / 60);
			var seconds = Math.floor(time % 60);

			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return `${minutes}:${seconds}`;
		}

		return (data, time) => {
			cover.setAttribute("src", `data:image/png;base64,${data.songCover}`);
			title.innerText = data.songName;
			subtitle.innerText = data.songSubName;						
			artist.innerText = data.songAuthorName;
			mapper.innerText = data.levelAuthorName;
			duration.innerText = format(data.length / 1000);
			timer.start(Date.now(), data.length);
		}
	})();

	return {
		hide() {
			main.classList.add("hidden");
		},

		show() {
			main.classList.remove("hidden");
		},

		performance,
		timer,
		beatmap,
		hpbar
	}
})();








connect();