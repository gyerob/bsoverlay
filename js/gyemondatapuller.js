const query = new URLSearchParams(location.search);

function connect() {
	var ip = query.get("ip") || "localhost";
	var port = query.get("port") || 2946;

	var socketmap = new WebSocket(`ws://${ip}:${port}/BSDataPuller/MapData`);
	var socketlive = new WebSocket(`ws://${ip}:${port}/BSDataPuller/LiveData`);

	socketmap.addEventListener("open", () => {
		console.log("WebSocket opened");
	});

	socketmap.addEventListener("message", (message) => {
		var mapdata = JSON.parse(message.data);
		
		ui.beatmap(data.beatmap, time);
		ui.performance(data.performance);
		ui.show();
	});

	socketmap.addEventListener("close", () => {
		console.log("Failed to connect, retrying");
		setTimeout(connect, 3000);
	});

	socketlive.addEventListener("open", () => {
		console.log("WebSocket opened");
	});

	socketlive.addEventListener("message", (message) => {
		var livedata = JSON.parse(message.data);
		
		ui.performance(data.performance);
	});

	socketlive.addEventListener("close", () => {
		console.log("Failed to connect, retrying");
		setTimeout(connect, 3000);
	});
}




const events = {
	

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
			energy.style.width = data.batteryEnergy + "%";
			console.log(data.batteryEnergy);
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
			cover.setAttribute("src", `data:image/png;base64,${data.coverImage}`);
			title.innerText = data.SongName;					
			artist.innerText = data.SongAuthor;
			mapper.innerText = data.Mapper;
			duration.innerText = format(data.Length);
			timer.start(Date.now()/1000, data.Length);
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
		beatmap
	}
})();








connect();